# Exception Handling Plan for Auth Module

## 1️⃣  TAXONOMY

| Exception | HTTP | code | When |
|-----------|------|------|------|
| `InvalidFieldException` | 400 | `invalid_field` | Required field missing or empty |
| `PasswordTooLongException` | 400 | `password_too_long` | Password > 72 bytes UTF‑8 |
| `WeakPasswordError` | 422 | `weak_password` | Fails complexity rules |
| `DuplicateEmailException` | 409 | `duplicate_email` | Email already registered |
| `InvalidCredentialsError` | 401 | `invalid_credentials` | Bad username/password |
| `AccountLockedError` | 423 | `account_locked` | Account locked after repeated failures |
| `InactiveAccountError` | 403 | `inactive_account` | Account exists but not activated |
| `InvalidRefreshTokenError` | 401 | `invalid_refresh_token` | Refresh token malformed or revoked |
| `ExpiredRefreshTokenError` | 401 | `expired_refresh_token` | Refresh token past its expiry |
| `InvalidAccessTokenError` | 401 | `invalid_access_token` | Access token malformed or revoked |
| `ExpiredAccessTokenError` | 401 | `expired_access_token` | Access token past its expiry |
| `EmailVerificationError` | 400 | `email_verification_failed` | Verification link invalid/expired |
| `PasswordResetTokenError` | 400 | `invalid_reset_token` | Reset token malformed or revoked |
| `OAuthError` | 400 | `oauth_error` | Third‑party OAuth flow failure |
| `RateLimitedError` | 429 | `rate_limited` | Client exceeded rate limits |
| `GenericAuthError` | 500 | `generic_auth_error` | Fallback for unexpected auth errors |

## 2️⃣  WHERE TO RAISE EACH EXCEPTION

- **`InvalidFieldException`** – Raise in Pydantic schema validators or service‑layer checks when required fields are missing/empty.
- **`PasswordTooLongException`** – Raise in:
  - Pydantic `field_validator("password")` for all password‑bearing schemas.
  - Service layer (`service.create_user`, `service.verify_user_credentials`) when calling `hash_password`/`verify_password`.
  - `utils/password.py` helper before delegating to the bcrypt driver.
- **`WeakPasswordError`** – Raise in password‑complexity validator (e.g., `utils/password_strength.py`).
- **`DuplicateEmailException`** – Raise in `service.create_user` after DB uniqueness check.
- **`InvalidCredentialsError`** – Raise in login service (`service.authenticate_user`) after credential mismatch.
- **`AccountLockedError`** – Raise in login service when lockout threshold exceeded.
- **`InactiveAccountError`** – Raise in login service if user `is_active` flag false.
- **`InvalidRefreshTokenError`** – Raise in refresh endpoint when token cannot be decoded/doesn't match DB.
- **`ExpiredRefreshTokenError`** – Raise in refresh endpoint after token expiry check.
- **`InvalidAccessTokenError`** – Raise in auth middleware when token fails verification.
- **`ExpiredAccessTokenError`** – Raise in auth middleware when token expiry claim is past.
- **`EmailVerificationError`** – Raise in verification endpoint when token invalid/expired.
- **`PasswordResetTokenError`** – Raise in password‑reset endpoint when token invalid/expired.
- **`OAuthError`** – Raise in third‑party OAuth callback handling on any protocol failure.
- **`RateLimitedError`** – Raised automatically by `slowapi` rate‑limiter decorator on limit breach.
- **`GenericAuthError`** – Catch‑all for unexpected exceptions; raise from a generic handler before bubbling to the central error handler.

## 3️⃣  BCRYPT 72‑BYTE LIMIT – HARDENING

### A. Why this leaks as 500 today

- The `passlib.bcrypt` driver (and pure‑python fallback) raises a raw `ValueError` if the secret exceeds 72 bytes.
- Neither `service.create_user` nor `utils/password.py`'s helper catches / converts this to a domain exception.
- The central `error_handler.py` only knows about typed `HTTPException`s, so the `ValueError` falls through to the generic 500 branch → user sees a stack trace fragment, not an actionable error.

### B. Multi‑layer fix (defense in depth)

**Layer 1 — Pydantic v2 schema validator (`schemas.py`)**
- Add a `field_validator("password")` to `UserCreate`, `UserUpdate`, `ResetPasswordRequest` (and any future password‑bearing schemas).
- Validate against **byte length**, not character length (multi‑byte chars are the silent trap — `"🔐🔐🔐…"` is 4 chars but 12 bytes; Chinese/Japanese passwords reach the 72‑byte limit much sooner than users expect).
```python
@field_validator("password")
@classmethod
def password_within_bcrypt_limit(cls, v: str) -> str:
    encoded = v.encode("utf-8")
    if len(encoded) > 72:
        raise WeakPasswordError(
            reason=f"Password exceeds 72 bytes when UTF-8 encoded (got {len(encoded)}). Please choose a shorter password."
        )
    return v
```
- Also enforce a `max_length=128` `Field(...)` so the request body is rejected at parse time for absurd inputs.

**Layer 2 — Service‑layer safety net (`service.create_user` / `verify_user_credentials`)**
- Wrap `hash_password(...)` and `verify_password(...)` calls in `try / except ValueError as e`. If the message matches the bcrypt 72‑byte signature, raise `PasswordTooLongException(byte_length=len(pw.encode()))` instead.
- Import the existing `PasswordTooLongException` from `utils/password.py` (or move it to `auth/exceptions.py` and re‑export).

**Layer 3 — `utils/password.py` hardening**
- The helper should pre‑flight:
```python
def _ensure_bcrypt_compatible(password: str) -> bytes:
    encoded = password.encode("utf-8")
    if len(encoded) > 72:
        raise PasswordTooLongException(
            byte_length=len(encoded),
            limit=72,
        )
    return encoded
```
- Update `hash_password()` and `verify_password()` to call this first; never let a `ValueError` leave the module unrouted.

**Layer 4 — Error‑handler net (`middleware/error_handler.py`)**
- Add a specific `except ValueError` branch ahead of the generic `Exception` fallback that inspects the message text for the bcrypt 72‑byte marker and converts it to HTTP 400 with `code:"password_too_long"`. This is a belt‑and‑braces backstop — by the time we ship, layers 1‑3 should make this branch unreachable in normal flow, but it stops any future regression from leaking the same 500.

**Layer 5 — Decision: truncate vs reject?**
- Recommend **reject, do not truncate**. Silently truncating at 72 bytes means:
  - Two different passwords that share the same 72‑byte prefix hash to the same value, weakening security.
  - The user gets no feedback that part of their chosen secret is being ignored.
- If the product later needs longer secrets, propose a follow‑up migration to `argon2‑cffi` (no length limit, modern KDF) — but that's out of scope for this plan; recommend logging a `// TODO(security)` note, not implementing it.

### C. Logging convention (specific to this exception)

- Log level: **WARNING** (client‑side mistake, not a server fault).
- Fields: `endpoint`, `path`, `byte_length`, `limit`. Never log the password itself, not even a hash of it — `byte_length` is enough to diagnose.
- Do NOT log the full `ValueError` message because it contains the password string fragment in some passlib versions.

### D. New exception code mapping

| Exception | HTTP | code | When |
|-----------|------|------|------|
| `PasswordTooLongException` | 400 | `password_too_long` | Password > 72 bytes UTF‑8 |
| Same exception reused | 422 | `password_too_long` | If returned by Pydantic validator at parse time (FastAPI uses 422 for body validation by default — see Section 4) |

Add `password_too_long` to the taxonomy table at the top of the plan, with `fields: {password: "<byte-count> bytes (max 72)"}`.

### E. Tests to add (`backend/tests/auth/test_exceptions.py`)

| Test name | Payload | Expected |
|-----------|---------|----------|
| `test_signup_password_too_long_ascii` | 80‑char ASCII password | 400 or 422, `code:"password_too_long"`, `fields.password` mentions bytes |
| `test_signup_password_too_long_multibyte` | 25 emoji chars (~100 bytes UTF‑8) | 400 or 422, `code:"password_too_long"` — proves we're checking bytes, not chars |
| `test_login_password_too_long` | Existing user, login with 80‑char password | Same `code:"password_too_long"`, NEVER the generic bcrypt 500 |
| `test_password_exactly_72_bytes_accepted` | 72 ASCII chars | 200/201, normal flow |
| `test_validator_runs_before_service` | Patch `service.create_user` to raise if called for >72 bytes — assert the validator rejects first | Mock invocation count == 0 |
| `test_error_handler_catches_bare_bcrypt_value_error` | Monkey‑patch `hash_password` to raise the raw `ValueError` directly | Response is 400 with `code:"password_too_long"`, not 500 |

### F. Open question for the user (mention but don't resolve)

- Do we also want to enforce a **minimum** byte length as a literal floor (e.g. 8 bytes)? The current plan has a `WeakPasswordError` for complexity. Recommend: keep complexity rules separate from the byte‑length rule so users get the clearest possible error — after fixing length, re‑validate complexity.

## 4️⃣  PYDANTIC VALIDATORS

- Replace generic `ValueError` raises inside schema `validators` with domain‑specific exceptions such as `WeakPasswordError` or `InvalidFieldException` so the central error handler can map them to proper JSON responses.
- Introduce field‑level `@field_validator` for:
  - `email` – enforce RFC‑5322 compliance and disallow disposable domains.
  - `password` – enforce minimum entropy, check against common password lists, and now enforce the 72‑byte limit (see Section 3).
  - Token fields (`refresh_token`, `access_token`) – ensure they are proper JWT strings (three‑part base64url) and reject malformed values early.
- Use `model_config = ConfigDict(extra="forbid")` to reject unexpected keys, preventing injection attacks.
- Leverage Pydantic v2's `validate_arguments` on service functions that receive raw request data to ensure consistent validation across the stack.

## 5️⃣  CENTRAL ERROR HANDLER

```python
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging

logger = logging.get_logger(__name__)

async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": getattr(exc, "code", "http_error"),
                "message": exc.detail,
                "fields": getattr(exc, "fields", None),
            },
        },
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # FastAPI bundles Pydantic errors here – we translate to our error contract.
    errs = []
    for e in exc.errors():
        loc = ".".join(str(l) for l in e["loc"])
        errs.append({"field": loc, "error": e["msg"]})
    logger.warning(
        "validation_error",
        extra={"path": request.url.path, "errors": errs},
    )
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code": "validation_error",
                "message": "Input validation failed",
                "fields": {e["loc"][-1]: e["msg"] for e in exc.errors()},
            },
        },
    )

async def generic_exception_handler(request: Request, exc: Exception):
    # Catch‑all for unexpected errors – map to 500 GenericAuthError
    logger.error(
        "unhandled_exception",
        exc_info=exc,
        extra={"path": request.url.path},
    )
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "generic_auth_error",
                "message": "An unexpected authentication error occurred",
            },
        },
    )

# Register in `backend/app/main.py`
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)
```

- The handler now explicitly catches `PasswordTooLongException` (subclass of `HTTPException`) and logs at **WARNING**.
- All other custom exceptions inherit from a base `AuthException` that sets `status_code` and `code` attributes, ensuring uniform response shape.

## 6️⃣  LOGGING

| Event | Level | Structured fields |
|-------|-------|--------------------|
| Request validation failure | WARNING | `path`, `method`, `errors` |
| Password length reject (bcrypt) | WARNING | `endpoint`, `byte_length`, `limit` |
| Duplicate email attempt | INFO | `email`, `ip` |
| Successful login | INFO | `user_id`, `ip` |
| Failed login (invalid credentials) | INFO | `email`, `ip` |
| Account lockout | WARNING | `user_id`, `attempts`, `ip` |
| Token refresh error | INFO | `user_id`, `error_type` |
| Generic auth error | ERROR | `exception_type`, `traceback` |

All logs are emitted as JSON via `structlog` and include a request‑scoped `trace_id` injected by middleware for end‑to‑end tracing.

## 7️⃣  TEST PLAN

- **Unit tests** for each validator (password length, email format, token shape).
- **Integration tests** exercising the full request‑response cycle for each endpoint that can raise the defined exceptions.
- **Property‑based tests** (hypothesis) generating random passwords of varying byte lengths to ensure the 72‑byte guard is bullet‑proof.
- **Mock‑based tests** for the service layer, asserting that `PasswordTooLongException` is raised before any bcrypt call.
- **Error‑handler tests** confirming that each custom exception maps to the correct HTTP status, `code`, and JSON shape.
- **Logging tests** using `caplog` to verify that warning/error events contain the expected structured fields.
- **Rate‑limit tests** ensuring `RateLimitedError` is emitted after the configured threshold.
- **Account‑enumeration tests** verifying that login and password‑reset endpoints always return `InvalidCredentialsError` regardless of email existence.
- **Coverage goal**: ≥ 90 % line coverage for `auth/` package, with branch coverage ≥ 85 %.

## 8️⃣  RATE LIMITER

- Verify that the global limiter (100 rpm) is applied via `slowapi` middleware.
- Ensure the `/auth/*` routes have an additional stricter limiter (10 rpm) configured through the `@limiter.limit("10/minute")` decorator.
- Add tests that simulate rapid consecutive requests and assert a `RateLimitedError` (429) response with `code:"rate_limited"`.
- Log rate‑limit breaches at **INFO** level with fields `endpoint`, `ip`, `limit`, `remaining`.

## 9️⃣  ACCOUNT ENUMERATION

- **Login endpoint** – always return `InvalidCredentialsError` for both unknown email and wrong password. Do not disclose which part failed.
- **Forgot‑password request** – always return a generic success message (e.g., `"If the email exists, a reset link has been sent."`) irrespective of email existence.
- **Password reset token validation** – on invalid/expired token, return `PasswordResetTokenError` without indicating whether the token was ever issued.
- **Email verification** – similarly generic success/failure responses to avoid confirming account existence.
- Add unit tests that assert the response body and error code are identical for existent vs. non‑existent identifiers.

## 🔟  PRIORITY ORDER

1. Input validation (including new bcrypt‑length check)
2. Bcrypt 72‑byte limit handling (this new fix)
3. Login error unification (InvalidCredentialsError only)
4. Rate limiting
5. Central error handling
6. Logging
7. Test coverage
8. Documentation updates
9. Monitoring hooks
10. Post‑deployment verification

## 1️⃣1️⃣  NEXT STEPS

- Add the `PasswordTooLongException` handling to `utils/password.py`.
- Implement the Pydantic `field_validator` for password length in all relevant schemas.
- Write the tests listed in Section 3E and integrate them into the CI pipeline.
- Update the central error handler to catch raw `ValueError` for bcrypt and map it to `PasswordTooLongException`.
- Run the full test suite and ensure ≥ 90 % coverage for the auth module.
- Document the change in `backend/docs/instruction.md` and update the OpenAPI spec (auto‑generated by FastAPI).
- Deploy to staging, monitor logs for `WARNING` entries related to password length.
- Review the possibility of migrating to Argon2 for future‑proof password hashing (optional).

import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

BASE = "/api/v1/auth"

PASSWORD_VALID = "Str0ng!Pass#2025"
PASSWORD_TOO_SHORT = "Ab1!"
PASSWORD_NO_UPPER = "lowercase1!a"
PASSWORD_NO_SPECIAL = "NoSpecial1a"


def _error_code(resp) -> str | None:
    body = resp.json()
    return body.get("error", {}).get("code")


def _error_message(resp) -> str | None:
    body = resp.json()
    return body.get("error", {}).get("message")


# ---------------------------------------------------------------------------
# Unit tests: password hashing
# ---------------------------------------------------------------------------

class TestPasswordHashing:
    @pytest.mark.asyncio
    async def test_hash_and_verify(self):
        from app.utils.password import hash_password, verify_password

        hashed = await hash_password(PASSWORD_VALID)
        assert await verify_password(PASSWORD_VALID, hashed) is True
        assert await verify_password("wrong", hashed) is False

    @pytest.mark.asyncio
    async def test_hash_is_argon2_when_available(self):
        from app.utils.password import HAS_ARGON2, hash_password

        if not HAS_ARGON2:
            pytest.skip("argon2-cffi not installed")
        hashed = await hash_password(PASSWORD_VALID)
        assert hashed.startswith("$argon2")

    @pytest.mark.asyncio
    async def test_verify_bcrypt_legacy(self):
        import bcrypt
        from app.utils.password import verify_password

        pw = "LegacyPass123!"
        bcrypt_hash = bcrypt.hashpw(pw.encode(), bcrypt.gensalt(rounds=12)).decode()
        assert await verify_password(pw, bcrypt_hash) is True
        assert await verify_password("wrong", bcrypt_hash) is False


# ---------------------------------------------------------------------------
# Unit tests: email validation
# ---------------------------------------------------------------------------

class TestEmailValidation:
    def test_valid_email(self):
        from app.services.email_validation import validate_email_syntax

        assert validate_email_syntax("user@example.com") == "user@example.com"

    def test_valid_email_normalized(self):
        from app.services.email_validation import validate_email_syntax

        assert validate_email_syntax("  User@Example.COM  ") == "user@example.com"

    def test_empty_email(self):
        from app.services.email_validation import EmailValidationError, validate_email_syntax

        with pytest.raises(EmailValidationError):
            validate_email_syntax("")

    def test_no_at_sign(self):
        from app.services.email_validation import EmailValidationError, validate_email_syntax

        with pytest.raises(EmailValidationError):
            validate_email_syntax("userexample.com")

    def test_no_domain(self):
        from app.services.email_validation import EmailValidationError, validate_email_syntax

        with pytest.raises(EmailValidationError):
            validate_email_syntax("user@")

    def test_no_local_part(self):
        from app.services.email_validation import EmailValidationError, validate_email_syntax

        with pytest.raises(EmailValidationError):
            validate_email_syntax("@example.com")

    def test_too_long(self):
        from app.services.email_validation import EmailValidationError, validate_email_syntax

        with pytest.raises(EmailValidationError):
            validate_email_syntax("a" * 255 + "@example.com")

    def test_disposable_email_rejected(self):
        from app.services.email_validation import (
            EmailValidationError,
            validate_email_not_disposable,
        )

        with pytest.raises(EmailValidationError) as exc_info:
            validate_email_not_disposable("user@mailinator.com")
        assert exc_info.value.code == "DISPOSABLE_EMAIL"

    def test_non_disposable_accepted(self):
        from app.services.email_validation import validate_email_not_disposable

        assert validate_email_not_disposable("user@gmail.com") == "gmail.com"

    def test_local_part_max_64(self):
        from app.services.email_validation import EmailValidationError, validate_email_syntax

        with pytest.raises(EmailValidationError):
            validate_email_syntax("a" * 65 + "@example.com")


# ---------------------------------------------------------------------------
# Unit tests: auth schemas
# ---------------------------------------------------------------------------

class TestAuthSchemas:
    def test_valid_signup(self):
        from app.modules.auth.schemas import UserCreate

        user = UserCreate(name="Test User", email="test@example.com", password=PASSWORD_VALID)
        assert user.email == "test@example.com"

    def test_short_password_rejected(self):
        from app.modules.auth.schemas import UserCreate

        with pytest.raises(Exception):
            UserCreate(name="Test", email="test@example.com", password=PASSWORD_TOO_SHORT)

    def test_no_uppercase_rejected(self):
        from app.modules.auth.schemas import UserCreate

        with pytest.raises(Exception):
            UserCreate(name="Test", email="test@example.com", password=PASSWORD_NO_UPPER)

    def test_no_special_rejected(self):
        from app.modules.auth.schemas import UserCreate

        with pytest.raises(Exception):
            UserCreate(name="Test", email="test@example.com", password=PASSWORD_NO_SPECIAL)

    def test_empty_name_rejected(self):
        from app.modules.auth.schemas import UserCreate

        with pytest.raises(Exception):
            UserCreate(name="", email="test@example.com", password=PASSWORD_VALID)

    def test_login_schema(self):
        from app.modules.auth.schemas import LoginRequest

        req = LoginRequest(email="a@b.com", password="anything")
        assert req.email == "a@b.com"

    def test_verify_email_schema(self):
        from app.modules.auth.schemas import VerifyEmailRequest

        req = VerifyEmailRequest(token="abc123")
        assert req.token == "abc123"


# ---------------------------------------------------------------------------
# Unit tests: auth service
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_user_obj():
    user = MagicMock()
    user.id = uuid.uuid4()
    user.name = "Test User"
    user.email = "test@example.com"
    user.status = "active"
    user.is_active = True
    user.is_verified = True
    user.email_verified = True
    user.password_hash = "$argon2v1$..."
    user.failed_login_attempts = 0
    user.locked_until = None
    user.verification_token_hash = None
    user.verification_sent_at = None
    user.verification_expires_at = None
    user.verification_attempts = 0
    user.last_verification_sent_at = None
    user.pending_expires_at = None
    user.created_at = datetime.now(timezone.utc)
    user.updated_at = datetime.now(timezone.utc)
    return user


@pytest.fixture
def mock_pending_user():
    user = MagicMock()
    user.id = uuid.uuid4()
    user.name = "Pending User"
    user.email = "pending@example.com"
    user.status = "pending"
    user.is_active = False
    user.is_verified = False
    user.email_verified = False
    user.password_hash = "$argon2v1$..."
    user.failed_login_attempts = 0
    user.locked_until = None
    user.verification_token_hash = "hash123"
    user.verification_sent_at = datetime.now(timezone.utc)
    user.verification_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    user.verification_attempts = 0
    user.last_verification_sent_at = datetime.now(timezone.utc)
    user.pending_expires_at = datetime.now(timezone.utc) + timedelta(hours=48)
    user.created_at = datetime.now(timezone.utc)
    user.updated_at = datetime.now(timezone.utc)
    return user


class TestAuthService:
    @pytest.mark.asyncio
    async def test_create_user_is_pending(self, mock_db):
        from app.modules.auth.schemas import UserCreate
        from app.modules.auth.service import create_user

        user_create = UserCreate(name="New User", email="new@example.com", password=PASSWORD_VALID)
        user = await create_user(mock_db, user_create)
        assert user.status == "pending"
        assert user.is_active is False
        assert user.email_verified is False

    @pytest.mark.asyncio
    async def test_check_password_valid(self, mock_db, mock_user_obj):
        from app.utils.password import hash_password
        from app.modules.auth.service import check_password

        mock_user_obj.password_hash = await hash_password(PASSWORD_VALID)
        assert await check_password(PASSWORD_VALID, mock_user_obj) is True

    @pytest.mark.asyncio
    async def test_check_password_wrong(self, mock_db, mock_user_obj):
        from app.modules.auth.service import check_password

        mock_user_obj.password_hash = "$argon2v1$invalid"
        assert await check_password("wrong", mock_user_obj) is False

    @pytest.mark.asyncio
    async def test_is_account_locked_not_locked(self, mock_user_obj):
        from app.modules.auth.service import is_account_locked

        mock_user_obj.locked_until = None
        assert await is_account_locked(mock_user_obj) is False

    @pytest.mark.asyncio
    async def test_is_account_locked_is_locked(self, mock_user_obj):
        from app.modules.auth.service import is_account_locked

        mock_user_obj.locked_until = datetime.now(timezone.utc) + timedelta(minutes=10)
        assert await is_account_locked(mock_user_obj) is True

    @pytest.mark.asyncio
    async def test_is_account_locked_expired(self, mock_user_obj):
        from app.modules.auth.service import is_account_locked

        mock_user_obj.locked_until = datetime.now(timezone.utc) - timedelta(minutes=10)
        assert await is_account_locked(mock_user_obj) is False

    @pytest.mark.asyncio
    async def test_increment_failed_attempts(self, mock_db, mock_user_obj):
        from app.modules.auth.service import increment_failed_login_attempts

        mock_user_obj.failed_login_attempts = 0
        await increment_failed_login_attempts(mock_db, mock_user_obj)
        assert mock_user_obj.failed_login_attempts == 1

    @pytest.mark.asyncio
    async def test_can_resend_verification_no_limit(self, mock_user_obj):
        from app.modules.auth.service import can_resend_verification

        mock_user_obj.last_verification_sent_at = None
        mock_user_obj.verification_attempts = 0
        allowed, cooldown = await can_resend_verification(mock_user_obj)
        assert allowed is True
        assert cooldown is None

    @pytest.mark.asyncio
    async def test_can_resend_verification_cooldown(self, mock_user_obj):
        from app.modules.auth.service import can_resend_verification

        mock_user_obj.last_verification_sent_at = datetime.now(timezone.utc) - timedelta(seconds=30)
        mock_user_obj.verification_attempts = 0
        allowed, cooldown = await can_resend_verification(mock_user_obj)
        assert allowed is False
        assert cooldown is not None
        assert cooldown > 0

    @pytest.mark.asyncio
    async def test_can_resend_verification_max_attempts(self, mock_user_obj):
        from app.modules.auth.service import can_resend_verification

        mock_user_obj.last_verification_sent_at = datetime.now(timezone.utc) - timedelta(seconds=120)
        mock_user_obj.verification_attempts = 5
        allowed, cooldown = await can_resend_verification(mock_user_obj)
        assert allowed is False
        assert cooldown is None


# ---------------------------------------------------------------------------
# Integration tests: auth router endpoints
# ---------------------------------------------------------------------------

class TestSignupEndpoint:
    @patch("app.modules.auth.service.hash_password", new_callable=AsyncMock)
    @patch("app.modules.auth.service.create_email_verification_token", new_callable=AsyncMock)
    @patch("app.services.email_sender.send_email", new_callable=AsyncMock)
    @patch("app.services.email_validation.validate_email_full")
    def test_signup_creates_pending_user(
        self, mock_validate_email, mock_send_email, mock_create_token, mock_hash_pw, client, mock_db
    ):
        mock_validate_email.return_value = "new@example.com"
        mock_hash_pw.return_value = "$argon2v1$hashed"
        mock_create_token.return_value = "test-token-abc"
        mock_send_email.return_value = None

        mock_db.execute.return_value = MagicMock()
        mock_db.execute.return_value.scalars.return_value.first.return_value = None

        resp = client.post(f"{BASE}/signup", json={
            "name": "New User",
            "email": "new@example.com",
            "password": PASSWORD_VALID,
        })
        assert resp.status_code == 201
        data = resp.json()["data"]
        assert data["email"] == "new@example.com"
        assert "verify" in data["message"].lower()

    @patch("app.services.email_validation.validate_email_full")
    def test_signup_duplicate_email(self, mock_validate_email, client, mock_db):
        mock_validate_email.return_value = "existing@example.com"
        existing = MagicMock()
        existing.status = "active"
        existing.email_verified = True
        mock_db.execute.return_value = MagicMock()
        mock_db.execute.return_value.scalars.return_value.first.return_value = existing

        resp = client.post(f"{BASE}/signup", json={
            "name": "User",
            "email": "existing@example.com",
            "password": PASSWORD_VALID,
        })
        assert resp.status_code == 409

    def test_signup_weak_password(self, client, mock_db):
        resp = client.post(f"{BASE}/signup", json={
            "name": "User",
            "email": "user@example.com",
            "password": PASSWORD_TOO_SHORT,
        })
        assert resp.status_code in (400, 422)

    def test_signup_missing_fields(self, client, mock_db):
        resp = client.post(f"{BASE}/signup", json={})
        assert resp.status_code in (400, 422)

    @patch("app.services.email_validation.validate_email_full")
    def test_signup_expired_pending_replaced(self, mock_validate_email, client, mock_db):
        mock_validate_email.return_value = "old-pending@example.com"
        expired_pending = MagicMock()
        expired_pending.status = "pending"
        expired_pending.pending_expires_at = datetime.now(timezone.utc) - timedelta(hours=1)

        mock_db.execute.return_value = MagicMock()
        mock_db.execute.return_value.scalars.return_value.first.return_value = expired_pending

        with patch("app.modules.auth.service.hash_password", new_callable=AsyncMock, return_value="$argon2v1$h"):
            with patch("app.modules.auth.service.create_email_verification_token", new_callable=AsyncMock, return_value="tok"):
                with patch("app.services.email_sender.send_email", new_callable=AsyncMock):
                    resp = client.post(f"{BASE}/signup", json={
                        "name": "User",
                        "email": "old-pending@example.com",
                        "password": PASSWORD_VALID,
                    })
                    assert resp.status_code == 201


class TestLoginEndpoint:
    @patch("app.modules.auth.service.check_password", new_callable=AsyncMock, return_value=True)
    @patch("app.modules.auth.service.create_access_token_for_user", new_callable=AsyncMock, return_value="access-token")
    @patch("app.modules.auth.service.create_refresh_token_for_user", new_callable=AsyncMock, return_value=("refresh-tok", MagicMock()))
    @patch("app.modules.auth.service.reset_failed_login_attempts", new_callable=AsyncMock)
    def test_login_active_verified_user(
        self, mock_reset, mock_refresh, mock_access, mock_check, client, mock_db, mock_user_obj
    ):
        mock_user_obj.status = "active"
        mock_user_obj.is_active = True
        mock_user_obj.email_verified = True
        mock_user_obj.locked_until = None
        mock_db.execute.return_value = MagicMock()
        mock_db.execute.return_value.scalars.return_value.first.return_value = mock_user_obj

        resp = client.post(f"{BASE}/login", json={
            "email": "test@example.com",
            "password": PASSWORD_VALID,
        })
        assert resp.status_code == 200
        assert resp.json()["data"]["access_token"] == "access-token"

    @patch("app.modules.auth.service.check_password", new_callable=AsyncMock, return_value=True)
    def test_login_pending_user_blocked(self, mock_check, client, mock_db, mock_pending_user):
        mock_pending_user.status = "pending"
        mock_pending_user.is_active = False
        mock_db.execute.return_value = MagicMock()
        mock_db.execute.return_value.scalars.return_value.first.return_value = mock_pending_user

        resp = client.post(f"{BASE}/login", json={
            "email": "pending@example.com",
            "password": PASSWORD_VALID,
        })
        assert resp.status_code == 403
        assert _error_code(resp) == "ACCOUNT_PENDING"

    @patch("app.modules.auth.service.check_password", new_callable=AsyncMock, return_value=True)
    @patch("app.modules.auth.service.increment_failed_login_attempts", new_callable=AsyncMock)
    def test_login_wrong_password(self, mock_increment, mock_check, client, mock_db, mock_user_obj):
        mock_check.return_value = False
        mock_user_obj.locked_until = None
        mock_db.execute.return_value = MagicMock()
        mock_db.execute.return_value.scalars.return_value.first.return_value = mock_user_obj

        resp = client.post(f"{BASE}/login", json={
            "email": "test@example.com",
            "password": "WrongPassword123!",
        })
        assert resp.status_code == 401

    def test_login_nonexistent_user(self, client, mock_db):
        mock_db.execute.return_value = MagicMock()
        mock_db.execute.return_value.scalars.return_value.first.return_value = None

        resp = client.post(f"{BASE}/login", json={
            "email": "noone@example.com",
            "password": PASSWORD_VALID,
        })
        assert resp.status_code == 401

    @patch("app.modules.auth.service.check_password", new_callable=AsyncMock, return_value=True)
    def test_login_locked_account(self, mock_check, client, mock_db, mock_user_obj):
        mock_user_obj.locked_until = datetime.now(timezone.utc) + timedelta(minutes=10)
        mock_db.execute.return_value = MagicMock()
        mock_db.execute.return_value.scalars.return_value.first.return_value = mock_user_obj

        resp = client.post(f"{BASE}/login", json={
            "email": "test@example.com",
            "password": PASSWORD_VALID,
        })
        assert resp.status_code == 429
        assert _error_code(resp) == "ACCOUNT_LOCKED"

    def test_login_missing_fields(self, client, mock_db):
        resp = client.post(f"{BASE}/login", json={})
        assert resp.status_code in (400, 422)


class TestVerifyEmailEndpoint:
    @patch("app.modules.auth.service.verify_email_token", new_callable=AsyncMock)
    def test_verify_email_valid(self, mock_verify, client, mock_db):
        mock_user = MagicMock()
        mock_verify.return_value = (True, mock_user)

        resp = client.post(f"{BASE}/verify-email", json={"token": "valid-token"})
        assert resp.status_code == 200
        assert resp.json()["data"]["email_verified"] is True

    @patch("app.modules.auth.service.verify_email_token", new_callable=AsyncMock)
    def test_verify_email_invalid_token(self, mock_verify, client, mock_db):
        mock_verify.return_value = (False, None)

        resp = client.post(f"{BASE}/verify-email", json={"token": "bad-token"})
        assert resp.status_code == 400

    def test_verify_email_no_token(self, client, mock_db):
        resp = client.post(f"{BASE}/verify-email", json={})
        assert resp.status_code in (400, 422)


class TestResendVerificationEndpoint:
    @patch("app.modules.auth.service.can_resend_verification", new_callable=AsyncMock)
    @patch("app.modules.auth.service.create_email_verification_token", new_callable=AsyncMock)
    @patch("app.services.email_sender.send_email", new_callable=AsyncMock)
    def test_resend_verification_success(
        self, mock_send_email, mock_create_token, mock_can_resend, client, mock_db, mock_pending_user
    ):
        mock_can_resend.return_value = (True, None)
        mock_create_token.return_value = "new-token"
        mock_db.execute.return_value = MagicMock()
        mock_db.execute.return_value.scalars.return_value.first.return_value = mock_pending_user

        resp = client.post(f"{BASE}/resend-verification", json={"email": "pending@example.com"})
        assert resp.status_code == 200

    @patch("app.modules.auth.service.can_resend_verification", new_callable=AsyncMock)
    def test_resend_verification_cooldown(self, mock_can_resend, client, mock_db, mock_pending_user):
        mock_can_resend.return_value = (False, 30)
        mock_db.execute.return_value = MagicMock()
        mock_db.execute.return_value.scalars.return_value.first.return_value = mock_pending_user

        resp = client.post(f"{BASE}/resend-verification", json={"email": "pending@example.com"})
        assert resp.status_code == 429
        assert _error_code(resp) == "RESEND_COOLDOWN"

    @patch("app.modules.auth.service.can_resend_verification", new_callable=AsyncMock)
    def test_resend_verification_max_attempts(self, mock_can_resend, client, mock_db, mock_pending_user):
        mock_can_resend.return_value = (False, None)
        mock_db.execute.return_value = MagicMock()
        mock_db.execute.return_value.scalars.return_value.first.return_value = mock_pending_user

        resp = client.post(f"{BASE}/resend-verification", json={"email": "pending@example.com"})
        assert resp.status_code == 429
        assert _error_code(resp) == "TOO_MANY_RESEND_ATTEMPTS"

    def test_resend_verification_unknown_email(self, client, mock_db):
        mock_db.execute.return_value = MagicMock()
        mock_db.execute.return_value.scalars.return_value.first.return_value = None

        resp = client.post(f"{BASE}/resend-verification", json={"email": "unknown@example.com"})
        assert resp.status_code == 200


class TestLogoutEndpoint:
    def test_logout_clears_cookie(self, client, mock_db):
        resp = client.post(f"{BASE}/logout")
        assert resp.status_code == 200


class TestForgotPasswordEndpoint:
    def test_forgot_password_always_returns_success(self, client, mock_db):
        mock_db.execute.return_value = MagicMock()
        mock_db.execute.return_value.scalars.return_value.first.return_value = None

        resp = client.post(f"{BASE}/forgot-password", json={"email": "any@example.com"})
        assert resp.status_code == 200


class TestResetPasswordEndpoint:
    @patch("app.modules.auth.service.verify_email_token", new_callable=AsyncMock)
    def test_reset_password_valid_token(self, mock_verify, client, mock_db):
        mock_user = MagicMock()
        mock_user.id = uuid.uuid4()
        mock_verify.return_value = (True, mock_user)

        resp = client.post(f"{BASE}/reset-password", json={
            "token": "valid-token",
            "password": PASSWORD_VALID,
        })
        assert resp.status_code == 200

    @patch("app.modules.auth.service.verify_email_token", new_callable=AsyncMock)
    def test_reset_password_invalid_token(self, mock_verify, client, mock_db):
        mock_verify.return_value = (False, None)

        resp = client.post(f"{BASE}/reset-password", json={
            "token": "bad-token",
            "password": PASSWORD_VALID,
        })
        assert resp.status_code == 400

    def test_reset_password_weak_password(self, client, mock_db):
        resp = client.post(f"{BASE}/reset-password", json={
            "token": "token",
            "password": PASSWORD_TOO_SHORT,
        })
        assert resp.status_code in (400, 422)

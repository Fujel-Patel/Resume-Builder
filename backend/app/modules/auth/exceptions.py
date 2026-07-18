"""Auth module exceptions — all use PRD error codes."""

from fastapi import HTTPException, status


class InvalidCredentialsException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "INVALID_CREDENTIALS",
                "message": "Incorrect email or password",
            },
            headers={"WWW-Authenticate": "Bearer"},
        )


class AccountLockedException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "code": "ACCOUNT_LOCKED",
                "message": "Account locked due to too many failed attempts. Try again in 15 minutes.",
            },
        )


class DuplicateEmailException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "CONFLICT",
                "message": "An account with this email already exists",
            },
        )


class InvalidTokenException(HTTPException):
    def __init__(self, message: str = "Invalid or expired token"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "TOKEN_INVALID",
                "message": message,
            },
        )


class InvalidFieldException(HTTPException):
    def __init__(self, field: str, message: str | None = None):
        msg = message or f"{field} is required"
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "VALIDATION_ERROR",
                "message": msg,
                "fields": {field: [msg]},
            },
        )


class EmailNotVerifiedException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "EMAIL_NOT_VERIFIED",
                "message": "Please verify your email before logging in. Check your inbox for a verification link.",
            },
        )


class AccountPendingException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "ACCOUNT_PENDING",
                "message": "Please verify your email to activate your account.",
            },
        )


class TooManyResendAttemptsException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "code": "TOO_MANY_RESEND_ATTEMPTS",
                "message": "Too many verification emails sent. Please try again later.",
            },
        )


class ResendCooldownException(HTTPException):
    def __init__(self, seconds: int):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "code": "RESEND_COOLDOWN",
                "message": f"Please wait {seconds} seconds before requesting another verification email.",
            },
        )


class EmailValidationException(HTTPException):
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_EMAIL",
                "message": message,
            },
        )


class WeakPasswordError(ValueError):
    def __init__(self, errors: list[str]):
        self.errors = errors
        super().__init__(", ".join(errors))


class PasswordTooLongException(ValueError):
    def __init__(self, byte_length: int):
        self.byte_length = byte_length
        super().__init__(
            f"Password is {byte_length} bytes long. Maximum allowed is 72 bytes."
        )

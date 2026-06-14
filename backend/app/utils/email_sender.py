import logging
from urllib.parse import quote

log = logging.getLogger("email_sender")


def send_verification_email(to_email: str, token: str, verification_url_base: str = "http://localhost:8000/api/v1/auth/verify-email") -> None:
    """Send a verification email.
    In this codebase we do not have an actual mailer, so we log the URL.
    Replace with real SMTP/third‑party service in production.
    """
    verification_link = f"{verification_url_base}?token={quote(token)}"
    # Placeholder: log the link
    log.info("Verification email to %s: %s", to_email, verification_link)


def send_password_reset_email(to_email: str, token: str, reset_url_base: str = "http://localhost:8000/api/v1/auth/reset-password") -> None:
    """Send a password‑reset email (placeholder)."""
    reset_link = f"{reset_url_base}?token={quote(token)}"
    log.info("Password reset email to %s: %s", to_email, reset_link)

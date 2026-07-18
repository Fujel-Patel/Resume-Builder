"""Legacy wrapper — redirects to the new email service.

For backward compatibility with existing imports.
New code should use ``app.services.email_sender`` directly.
"""

from urllib.parse import quote

from loguru import logger


def send_verification_email(to_email: str, token: str, verification_url_base: str = "http://localhost:8000/api/v1/auth/verify-email") -> None:
    """Legacy sync wrapper. New code should use async ``send_verification_email_async``."""
    verification_link = f"{verification_url_base}?token={quote(token)}"
    logger.info("Verification email to {}: {}", to_email, verification_link)


def send_password_reset_email(to_email: str, token: str, reset_url_base: str = "http://localhost:8000/api/v1/auth/reset-password") -> None:
    """Legacy sync wrapper."""
    reset_link = f"{reset_url_base}?token={quote(token)}"
    logger.info("Password reset email to {}: {}", to_email, reset_link)

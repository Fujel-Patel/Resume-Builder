"""Email sending service with provider abstraction.

Supports: SMTP (via aiosmtplib), Resend API, SendGrid API.
Falls back to logging if no provider is configured.
"""

from abc import ABC, abstractmethod
from typing import Optional

import httpx
from loguru import logger

from app.config.settings import settings


class EmailProvider(ABC):
    """Abstract base for email providers."""

    @abstractmethod
    async def send(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None,
    ) -> bool: ...


class SMTPProvider(EmailProvider):
    """Send email via SMTP (aiosmtplib)."""

    async def send(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None,
    ) -> bool:
        try:
            import aiosmtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart

            msg = MIMEMultipart("alternative")
            msg["From"] = settings.EMAIL_FROM
            msg["To"] = to_email
            msg["Subject"] = subject

            if text_body:
                msg.attach(MIMEText(text_body, "plain"))
            msg.attach(MIMEText(html_body, "html"))

            use_tls = settings.SMTP_PORT == 465
            await aiosmtplib.send(
                msg,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASS,
                use_tls=use_tls,
                start_tls=not use_tls,
            )
            return True
        except Exception:
            logger.exception("SMTP send failed for {}", to_email)
            return False


class ResendProvider(EmailProvider):
    """Send email via Resend API."""

    API_URL = "https://api.resend.com/emails"

    async def send(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None,
    ) -> bool:
        api_key = getattr(settings, "RESEND_API_KEY", "")
        if not api_key:
            logger.warning("RESEND_API_KEY not set, falling back to SMTP")
            return await SMTPProvider().send(to_email, subject, html_body, text_body)
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                payload: dict = {
                    "from": settings.EMAIL_FROM,
                    "to": [to_email],
                    "subject": subject,
                    "html": html_body,
                }
                if text_body:
                    payload["text"] = text_body
                resp = await client.post(
                    self.API_URL,
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                )
                if resp.status_code in (200, 201):
                    return True
                logger.error("Resend API returned {}: {}", resp.status_code, resp.text)
                return False
        except Exception:
            logger.exception("Resend API send failed for {}", to_email)
            return False


class SendGridProvider(EmailProvider):
    """Send email via SendGrid API."""

    API_URL = "https://api.sendgrid.com/v3/mail/send"

    async def send(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None,
    ) -> bool:
        api_key = getattr(settings, "SENDGRID_API_KEY", "")
        if not api_key:
            logger.warning("SENDGRID_API_KEY not set, falling back to SMTP")
            return await SMTPProvider().send(to_email, subject, html_body, text_body)
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                content: list[dict] = [{"type": "text/html", "value": html_body}]
                if text_body:
                    content.insert(0, {"type": "text/plain", "value": text_body})
                payload = {
                    "personalizations": [{"to": [{"email": to_email}]}],
                    "from": {"email": settings.EMAIL_FROM},
                    "subject": subject,
                    "content": content,
                }
                resp = await client.post(
                    self.API_URL,
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                )
                if resp.status_code in (200, 201, 202):
                    return True
                logger.error("SendGrid API returned {}: {}", resp.status_code, resp.text)
                return False
        except Exception:
            logger.exception("SendGrid API send failed for {}", to_email)
            return False


class LogProvider(EmailProvider):
    """Fallback: log email instead of sending (dev/test)."""

    async def send(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None,
    ) -> bool:
        import re
        logger.info("Email to {} | Subject: {}", to_email, subject)
        urls = re.findall(r'href="(https?://[^"]*verify[^"]*)"', html_body)
        if urls:
            logger.info("🔗 Verification link: {}", urls[0])
        else:
            logger.debug("HTML body preview (first 500 chars): {}", html_body[:500])
        return True


def _get_provider() -> EmailProvider:
    """Select email provider based on configured env vars."""
    provider_name = getattr(settings, "EMAIL_PROVIDER", "").lower()
    if provider_name == "resend":
        return ResendProvider()
    if provider_name == "sendgrid":
        return SendGridProvider()
    if provider_name == "smtp":
        return SMTPProvider()
    if provider_name == "log":
        return LogProvider()
    if getattr(settings, "RESEND_API_KEY", ""):
        return ResendProvider()
    if getattr(settings, "SMTP_PASS", ""):
        return SMTPProvider()
    return LogProvider()


async def send_email(
    to_email: str,
    subject: str,
    html_body: str,
    text_body: Optional[str] = None,
) -> bool:
    """Send an email using the configured provider."""
    provider = _get_provider()
    return await provider.send(to_email, subject, html_body, text_body)

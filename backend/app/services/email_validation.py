"""Email validation service — RFC-compliant syntax, MX records, disposable domains."""

import re

import dns.resolver
from loguru import logger

# Common disposable email domains (top offenders)
DISPOSABLE_DOMAINS: set[str] = {
    "mailinator.com", "guerrillamail.com", "guerrillamail.net",
    "tempmail.com", "temp-mail.org", "tempail.com", "tempr.email",
    "throwaway.email", "discard.email", "discardmail.com",
    "10minutemail.com", "10minutemail.co.za", "20minutemail.com",
    "maildrop.cc", "mailnesia.com", "trashmail.com", "trashmail.net",
    "trashmail.me", "yopmail.com", "yopmail.fr",
    "fakeinbox.com", "sharklasers.com", "guerrillamailblock.com",
    "grr.la", "dispostable.com", "mailcatch.com",
    "tempinbox.com", "tempinbox.co.uk", "tempmailer.com",
    "boun.cr", "bouncr.com", "chammy.info", "devnullmail.com",
    "getairmail.com", "getnada.com", "mohmal.com",
    "harakirimail.com", "jetable.org", "nospam.ze.tc",
    "nomail.xl.cx", "novosti-nk.ru", "owlpic.com",
    "tradermail.info", "safe-mail.net", "sogetthis.com",
    "safetymail.info", "filzmail.com", "kurzepost.de",
    "spam4.me", "spaml.de", "slyip.com",
    "putthisinyouremail.com", "spamfree24.org", "spamgourmet.com",
    "spambox.us", "spamcero.com", "spamspot.com",
    "superrito.com", "teleworm.us", "tempalias.com",
    "thankyou2010.com", "thisisnotmyrealemail.com",
    "tradermail.info", "trashymail.com", "tqlwn.com",
    "uggsrock.com", "wegwerfmail.de", "wegwerfmail.net",
    "wetrainbayarea.com", "wetrainbayarea.org",
    "wh4f.org", "whatiaas.com", "whatpaas.com",
    "wilemail.com", "willhackforfood.biz", "willselfdestruct.com",
    "winemaven.info", "wronghead.com",
}

# RFC 5322 email regex (simplified but robust)
_EMAIL_RE = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+"
    r"@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?"
    r"(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
)


class EmailValidationError(Exception):
    """Raised when email validation fails."""

    def __init__(self, message: str, code: str = "INVALID_EMAIL"):
        self.message = message
        self.code = code
        super().__init__(message)


def validate_email_syntax(email: str) -> str:
    """Validate email format per RFC 5322. Returns normalized email."""
    email = email.strip().lower()
    if not email or len(email) > 254:
        raise EmailValidationError("Email address is invalid", "INVALID_EMAIL")
    if not _EMAIL_RE.match(email):
        raise EmailValidationError("Email address is invalid", "INVALID_EMAIL")
    # Must have exactly one @
    if email.count("@") != 1:
        raise EmailValidationError("Email address is invalid", "INVALID_EMAIL")
    local, domain = email.rsplit("@", 1)
    if not local or not domain:
        raise EmailValidationError("Email address is invalid", "INVALID_EMAIL")
    # Local part max 64 chars
    if len(local) > 64:
        raise EmailValidationError("Email address is invalid", "INVALID_EMAIL")
    return email


def validate_email_domain(email: str) -> str:
    """Check that the email domain exists and has MX records."""
    domain = email.rsplit("@", 1)[1]
    try:
        mx_records = dns.resolver.resolve(domain, "MX")
        if not mx_records:
            raise EmailValidationError(
                "Email domain does not accept email", "INVALID_EMAIL_DOMAIN"
            )
    except dns.resolver.NoAnswer:
        # Domain exists but no MX — try A record as fallback
        try:
            dns.resolver.resolve(domain, "A")
        except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN):
            raise EmailValidationError(
                "Email domain does not accept email", "INVALID_EMAIL_DOMAIN"
            )
    except dns.resolver.NXDOMAIN:
        raise EmailValidationError(
            "Email domain does not exist", "INVALID_EMAIL_DOMAIN"
        )
    except dns.resolver.NoNameservers:
        raise EmailValidationError(
            "Email domain is unreachable", "INVALID_EMAIL_DOMAIN"
        )
    except Exception:
        # On DNS failures, log warning but don't block (provider may be down)
        logger.warning("DNS lookup failed for domain {}, allowing signup", domain)
    return domain


def validate_email_not_disposable(email: str) -> str:
    """Reject disposable/throwaway email addresses."""
    domain = email.rsplit("@", 1)[1]
    if domain in DISPOSABLE_DOMAINS:
        raise EmailValidationError(
            "Disposable email addresses are not allowed",
            "DISPOSABLE_EMAIL",
        )
    return domain


def validate_email_full(email: str) -> str:
    """Full email validation: syntax + domain + MX + disposable check.
    Returns the normalized email address.
    """
    email = validate_email_syntax(email)
    validate_email_not_disposable(email)
    validate_email_domain(email)
    return email

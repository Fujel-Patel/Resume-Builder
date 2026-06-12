import hashlib
import secrets
import uuid


def generate_email_token() -> str:
    """Generate a cryptographically random token for email verification or password reset.
    Using a combination of UUID4 and secrets to increase entropy.
    """
    return f"{uuid.uuid4().hex}{secrets.token_hex(16)}"


def hash_email_token(token: str) -> str:
    """Hash an email token using SHA-256 for safe storage in the DB.
    The same hash is used when verifying the token.
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

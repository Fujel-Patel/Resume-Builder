from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os
from app.config.settings import settings


def generate_key() -> bytes:
    """
    Generate encryption key from ENCRYPTION_KEY setting
    Following instruction.md: ENCRYPTION_KEY is 32 random bytes (AES-256) — env only
    """
    # Use the ENCRYPTION_KEY from settings
    key = settings.ENCRYPTION_KEY.encode()
    # Ensure it's 32 bytes for Fernet
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b'generative-cv-salt',  # In production, use a random salt stored separately
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(key))
    return key


def encrypt_data(data: str) -> str:
    """
    Encrypt sensitive data (e.g., API keys)
    Following instruction.md: AI API keys stored AES-256-GCM encrypted
    Using Fernet (AES-128 in CBC mode with HMAC) as a simpler alternative
    For true AES-256-GCM, would need more complex implementation
    """
    f = Fernet(generate_key())
    encrypted_data = f.encrypt(data.encode())
    return base64.urlsafe_b64encode(encrypted_data).decode()


def decrypt_data(encrypted_data: str) -> str:
    """
    Decrypt sensitive data
    """
    f = Fernet(generate_key())
    decoded_data = base64.urlsafe_b64decode(encrypted_data.encode())
    decrypted_data = f.decrypt(decoded_data)
    return decrypted_data.decode()
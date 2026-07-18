"""Application settings — Pydantic BaseSettings. Crashes on startup if required fields missing."""

from pathlib import Path
from typing import List, Union

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]  # backend/app/config → backend


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # App
    APP_ENV: str = "development"
    PORT: int = 8000
    SECRET_KEY: str

    # Database
    DATABASE_URL: str
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800

    # JWT — two separate secrets per security checklist
    JWT_ACCESS_SECRET: str
    JWT_REFRESH_SECRET: str
    JWT_ACCESS_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_EXPIRE_DAYS: int = 7

    # AES-256 encryption for stored AI API keys
    ENCRYPTION_KEY: str

    # CORS
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:3000"
    CLIENT_URL: str = "http://localhost:3000"
    FRONTEND_URL: str = "http://localhost:3000"
    VERCEL_PROJECT_NAME: str = ""

    # Email / SMTP configuration
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    EMAIL_FROM: str = "noreply@generative-cv.com"
    EMAIL_PROVIDER: str = ""  # smtp | resend | sendgrid | log (empty = auto-detect)

    # Email provider API keys (optional)
    RESEND_API_KEY: str = ""
    SENDGRID_API_KEY: str = ""

    # Email verification settings
    VERIFICATION_TOKEN_EXPIRE_MINUTES: int = 15
    VERIFICATION_MAX_ATTEMPTS: int = 5
    RESEND_COOLDOWN_SECONDS: int = 60
    RESEND_MAX_PER_DAY: int = 5
    PENDING_ACCOUNT_EXPIRE_HOURS: int = 48

    # Password requirements
    PASSWORD_MIN_LENGTH: int = 12
    PASSWORD_MAX_BYTES: int = 72

    # Brute-force protection
    MAX_LOGIN_ATTEMPTS: int = 5
    LOCKOUT_MINUTES: int = 15

    # Uploaded file storage
    UPLOAD_DIR: str = "./uploads"

    # Supabase / Storage
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    STORAGE_BUCKET: str = "resume-uploads"

    # PDF export via Playwright
    PDF_EXPORT_TIMEOUT_MS: int = 30000

    # Observability (optional)
    SENTRY_DSN: str = ""


settings = Settings()

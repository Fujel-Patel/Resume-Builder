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
    # FIX: removed secrets.token_hex(64) default — that generates a NEW key every
    # restart, invalidating ALL active sessions. Must be set explicitly in .env
    SECRET_KEY: str

    # Database
    DATABASE_URL: str

    # JWT — two separate secrets per PRD security checklist
    JWT_ACCESS_SECRET: str
    JWT_REFRESH_SECRET: str
    JWT_ACCESS_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_EXPIRE_DAYS: int = 7

    # AES-256 encryption for stored AI API keys
    ENCRYPTION_KEY: str

    # CORS
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:3000"
    CLIENT_URL: str = "http://localhost:3000"

    # Email
    SMTP_HOST: str = "smtp.resend.com"
    SMTP_PORT: int = 465
    SMTP_USER: str = "resend"
    SMTP_PASS: str = ""
    EMAIL_FROM: str = "noreply@generative-cv.com"

    # Uploaded file storage for "default" template preservation
    UPLOAD_DIR: str = "./uploads"

    # Supabase / Storage
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    STORAGE_BUCKET: str = "resume-uploads"


settings = Settings()

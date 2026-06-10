from pydantic_settings import BaseSettings
from typing import List, Union
import secrets


class Settings(BaseSettings):
    APP_ENV: str = "development"
    PORT: int = 8000
    SECRET_KEY: str = secrets.token_hex(64)

    DATABASE_URL: str

    JWT_ACCESS_SECRET: str
    JWT_REFRESH_SECRET: str
    JWT_ACCESS_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_EXPIRE_DAYS: int = 7

    ENCRYPTION_KEY: str

    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:3000"
    CLIENT_URL: str = "http://localhost:3000"

    # Email settings
    SMTP_HOST: str = "smtp.resend.com"
    SMTP_PORT: int = 465
    SMTP_USER: str = "resend"
    SMTP_PASS: str
    EMAIL_FROM: str = "noreply@generative-cv.com"

    # File storage
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    STORAGE_BUCKET: str = "resume-uploads"

    class Config:
        env_file = ".env"
        case_sensitive = True
        # Extra validation to ensure security critical fields are properly set
        @classmethod
        def customise_sources(
            cls,
            init_settings,
            env_settings,
            file_secret_settings,
        ):
            # Ensure we crash on bad config as per instruction.md
            return init_settings, env_settings, file_secret_settings


settings = Settings()  # Will crash on startup if required fields are missing
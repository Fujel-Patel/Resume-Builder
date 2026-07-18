"""FastAPI app entry point — middleware, routers, rate limiting."""

import re
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy import text

from app.config.database import engine
from app.config.logging import setup_logging
from app.config.settings import settings
from app.limiter import limiter
from app.middleware.auth import AuthMiddleware
from app.middleware.body_size_limit import BodySizeLimitMiddleware
from app.middleware.cache_control import CacheControlMiddleware
from app.middleware.error_handler import ErrorHandlerMiddleware, validation_exception_handler
from app.middleware.metrics import PrometheusMiddleware, metrics_endpoint
from app.middleware.request_logger import RequestLoggingMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.utils.http_client import close_client as close_http_client
from app.scripts.init_db import create_tables
from app.modules.ai.router import router as ai_router
from app.modules.ai_providers.router import router as ai_providers_router
from app.modules.ats.router import router as ats_router
from app.modules.auth.router import router as auth_router
from app.modules.resumes.router import router as resumes_router
from app.modules.users.router import router as users_router

setup_logging(debug=(settings.APP_ENV == "development"))


def _init_sentry():
    if not settings.SENTRY_DSN:
        return
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration

        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            environment=settings.APP_ENV,
            traces_sample_rate=0.1,
            integrations=[FastApiIntegration()],
        )
        logger.info("Sentry initialised (env={})", settings.APP_ENV)
    except ImportError:
        logger.warning("SENTRY_DSN set but sentry-sdk not installed — skipping")


_init_sentry()


def _validate_secrets():
    """In production, abort if secrets are still at placeholder/default values."""
    if settings.APP_ENV != "production":
        return
    weak_keys = []
    for name in ("SECRET_KEY", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "ENCRYPTION_KEY"):
        val = getattr(settings, name, "")
        if len(val) < 32:
            weak_keys.append(name)
    if weak_keys:
        logger.critical(
            "SECRET_VALIDATION_FAILED — {} shorter than 32 chars. "
            "Set strong secrets in production .env. Aborting startup.",
            ", ".join(weak_keys),
        )
        sys.exit(1)


async def _purge_expired_data():
    """Background task: purge expired tokens + expired pending accounts."""
    import asyncio
    while True:
        await asyncio.sleep(600)  # every 10 minutes
        try:
            from app.config.database import AsyncSessionLocal
            from sqlalchemy import delete, select
            from app.modules.auth.models import RefreshToken, EmailToken
            from app.modules.users.models import User
            from datetime import datetime, timezone

            async with AsyncSessionLocal() as session:
                now = datetime.now(timezone.utc)

                # Purge expired refresh tokens
                await session.execute(
                    delete(RefreshToken).where(RefreshToken.expires_at < now)
                )

                # Purge expired/used email tokens
                await session.execute(
                    delete(EmailToken).where(
                        (EmailToken.expires_at < now) | (EmailToken.used_at.isnot(None))
                    )
                )

                # Purge expired pending accounts
                result = await session.execute(
                    select(User.id).where(
                        User.status == "pending",
                        User.pending_expires_at < now,
                    )
                )
                expired_ids = [row[0] for row in result.all()]
                if expired_ids:
                    # Delete their email tokens first (FK)
                    await session.execute(
                        delete(EmailToken).where(EmailToken.user_id.in_(expired_ids))
                    )
                    await session.execute(
                        delete(RefreshToken).where(RefreshToken.user_id.in_(expired_ids))
                    )
                    await session.execute(
                        delete(User).where(User.id.in_(expired_ids))
                    )
                    logger.info("Purged {} expired pending accounts", len(expired_ids))

                await session.commit()
                logger.debug("Background purge completed")
        except Exception:
            logger.exception("Background purge failed")


@asynccontextmanager
async def lifespan(app: FastAPI):
    _validate_secrets()
    logger.info("Starting up — environment={}", settings.APP_ENV)
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
    if settings.APP_ENV == "development":
        await create_tables()
    logger.info("Database ready")

    import asyncio
    purge_task = asyncio.create_task(_purge_expired_data())

    yield

    purge_task.cancel()
    logger.info("Shutting down")
    try:
        from app.services.pdf_service import shutdown_browser
        await shutdown_browser()
    except (ImportError, AttributeError):
        pass
    await close_http_client()
    await engine.dispose()


app = FastAPI(
    title="Generative-CV API",
    description="AI-powered resume builder SaaS backend",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json" if settings.APP_ENV == "development" else None,
    docs_url="/api/v1/docs" if settings.APP_ENV == "development" else None,
    redoc_url="/api/v1/redoc" if settings.APP_ENV == "development" else None,
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# Rate limiting
# ---------------------------------------------------------------------------
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# ---------------------------------------------------------------------------
# Middleware — order matters: ErrorHandler wraps Auth, CORS wraps everything
# ---------------------------------------------------------------------------
app.add_middleware(BodySizeLimitMiddleware)
app.add_middleware(AuthMiddleware)
app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(CacheControlMiddleware)
app.add_middleware(PrometheusMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

# ---------------------------------------------------------------------------
# CORS — outermost so it runs LAST on response (catches error responses too)
# ---------------------------------------------------------------------------
origins = list({
    settings.CLIENT_URL,
    *(settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]),
    *(["http://localhost:3000", "http://127.0.0.1:3000"] if settings.APP_ENV == "development" else []),
})

_cors_regex = None
if settings.VERCEL_PROJECT_NAME:
    _cors_regex = rf"https://{re.escape(settings.VERCEL_PROJECT_NAME)}(-[a-zA-Z0-9]{{1,}})?\.vercel\.app"

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=_cors_regex,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# ---------------------------------------------------------------------------
# Exception handlers
# ---------------------------------------------------------------------------

async def http_exception_handler(request: Request, exc: HTTPException):
    """Return PRD-shaped error response for HTTPException."""
    from starlette.responses import JSONResponse as StarletteJSONResponse
    detail = exc.detail
    if isinstance(detail, dict):
        code = detail.get("code", "INTERNAL_ERROR")
        message = detail.get("message", "An error occurred")
        fields = detail.get("fields")
    else:
        status_code_map = {
            400: "INVALID_REQUEST", 401: "UNAUTHORIZED", 403: "FORBIDDEN",
            404: "NOT_FOUND", 409: "CONFLICT", 422: "VALIDATION_ERROR",
            423: "ACCOUNT_LOCKED", 429: "RATE_LIMIT_EXCEEDED", 500: "INTERNAL_ERROR",
        }
        code = status_code_map.get(exc.status_code, "INTERNAL_ERROR")
        message = str(detail)
        fields = None
    content = {"success": False, "data": None, "error": {"code": code, "message": message}}
    if fields:
        content["error"]["fields"] = fields
    return StarletteJSONResponse(status_code=exc.status_code, content=content, headers=getattr(exc, "headers", None))

app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(auth_router,        prefix="/api/v1/auth",        tags=["auth"])
app.include_router(users_router,       prefix="/api/v1/users",       tags=["users"])
app.include_router(resumes_router,     prefix="/api/v1/resumes",     tags=["resumes"])
app.include_router(ai_router,          prefix="/api/v1/ai",          tags=["ai"])
app.include_router(ai_providers_router, prefix="/api/v1/settings/ai", tags=["ai-settings"])
app.include_router(ats_router,         prefix="/api/v1/ats",         tags=["ats"])

# ---------------------------------------------------------------------------
# Health + Observability
# ---------------------------------------------------------------------------

@app.get("/health", tags=["health"])
@limiter.exempt
async def health():
    return {"status": "healthy"}


@app.get("/ready", tags=["health"])
@limiter.exempt
async def ready():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception:
        raise HTTPException(status_code=503, detail="Database unavailable")


@app.get("/metrics", tags=["observability"])
@limiter.exempt
async def metrics():
    return metrics_endpoint()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=settings.APP_ENV == "development")

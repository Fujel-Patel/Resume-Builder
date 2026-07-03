"""FastAPI app entry point — middleware, routers, rate limiting."""

from contextlib import asynccontextmanager
from starlette.middleware.cors import CORSMiddleware
import re

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from sqlalchemy import text

from app.config.database import Base, engine
from app.config.settings import settings
from app.middleware.auth import AuthMiddleware
from app.middleware.error_handler import ErrorHandlerMiddleware, validation_exception_handler
from app.utils.http_client import close_client as close_http_client
from app.modules.ai.router import router as ai_router
from app.modules.ai_providers.router import router as ai_providers_router
from app.modules.ats.router import router as ats_router
from app.modules.auth.router import router as auth_router
from app.modules.resumes.router import router as resumes_router
from app.modules.users.router import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Cleanup Playwright browser on shutdown
    try:
        from app.services.pdf_service import shutdown_browser
        await shutdown_browser()
    except ImportError:
        pass  # playwright not installed

    # Close shared HTTP client (connection pool)
    await close_http_client()


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
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# ---------------------------------------------------------------------------
# Middleware — order matters: ErrorHandler wraps Auth, CORS wraps everything
# ---------------------------------------------------------------------------
app.add_middleware(AuthMiddleware)
app.add_middleware(ErrorHandlerMiddleware)

# ---------------------------------------------------------------------------
# CORS — outermost so it runs LAST on response (catches error responses too)
# ---------------------------------------------------------------------------
origins = list({
    settings.CLIENT_URL,
    *(settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]),
    *(["http://localhost:3000", "http://127.0.0.1:3000"] if settings.APP_ENV == "development" else []),
})

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # catches ALL preview + prod vercel URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
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
# Health
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=settings.APP_ENV == "development")

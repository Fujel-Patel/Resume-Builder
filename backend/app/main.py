from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.middleware.auth import AuthMiddleware
from app.middleware.error_handler import ErrorHandlerMiddleware
from app.modules.ai.router import router as ai_router
from app.modules.ai_providers.router import router as ai_providers_router
from backend.app.modules.auth.ats.router import router as ats_router
from app.modules.auth.router import router as auth_router
from app.modules.resumes.router import router as resumes_router
from app.modules.users.router import router as users_router

app = FastAPI(
    title="Generative-CV API",
    description="AI-powered resume builder SaaS backend",
    version="0.1.0",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
)

# CORS middleware - following instruction.md best practices
# Explicit origin list, never using wildcard with credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.CLIENT_URL,
        "http://localhost:3000",
    ]
    if isinstance(settings.CORS_ORIGINS, str)
    else settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Custom middleware
app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(AuthMiddleware)


# Health check endpoints
@app.get("/health", tags=["health"])
async def health_check():
    """Liveness probe - returns 200 if process is up"""
    return {"status": "healthy"}


@app.get("/ready", tags=["health"])
async def readiness_check():
    """Readiness probe - returns 200 if dependencies are usable"""
    # In a real implementation, we'd check database connectivity here
    return {"status": "ready"}


# Include API routers with version prefix
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users_router, prefix="/api/v1/users", tags=["users"])
app.include_router(resumes_router, prefix="/api/v1/resumes", tags=["resumes"])
app.include_router(ai_router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(
    ai_providers_router, prefix="/api/v1/settings/ai", tags=["ai-settings"]
)
app.include_router(ats_router, prefix="/api/v1/ats", tags=["ats"])

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.APP_ENV == "development",
    )

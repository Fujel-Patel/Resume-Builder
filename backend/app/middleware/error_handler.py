"""Global exception handler — maps all exceptions to PRD response shape.

PRD response shape:
  Success: { "success": true, "data": { ... } }
  Error:   { "success": false, "error": { "code": "...", "message": "...", "fields": {...} } }
"""

from typing import Callable

from fastapi import Request, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware


def _error_body(code: str, message: str, fields: dict = None) -> dict:
    body = {"success": False, "data": None, "error": {"code": code, "message": message}}
    if fields:
        body["error"]["fields"] = fields
    return body


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            return await call_next(request)
        except Exception as exc:
            logger.exception("Unhandled exception: {}", exc)

            # FastAPI HTTPException (has status_code + detail)
            if hasattr(exc, "status_code"):
                detail = getattr(exc, "detail", "An error occurred")
                if isinstance(detail, dict):
                    # Our custom exceptions return detail as dict with code/message/fields
                    code = detail.get("code", "INTERNAL_ERROR")
                    message = detail.get("message", "An error occurred")
                    fields = detail.get("fields")
                else:
                    # Map HTTP status to PRD error code
                    status_code_map = {
                        400: "INVALID_REQUEST",
                        401: "UNAUTHORIZED",
                        403: "FORBIDDEN",
                        404: "NOT_FOUND",
                        409: "CONFLICT",
                        422: "VALIDATION_ERROR",
                        423: "ACCOUNT_LOCKED",
                        429: "RATE_LIMIT_EXCEEDED",
                        500: "INTERNAL_ERROR",
                    }
                    code = status_code_map.get(exc.status_code, "INTERNAL_ERROR")
                    message = str(detail)
                    fields = None

                return JSONResponse(
                    status_code=exc.status_code,
                    content=_error_body(code, message, fields),
                )

            # Unhandled Python exception
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content=_error_body("INTERNAL_ERROR", "An internal server error occurred"),
            )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors with PRD shape."""
    fields = {}
    for error in exc.errors():
        loc = ".".join(str(x) for x in error["loc"] if x != "body")
        fields.setdefault(loc, []).append(error["msg"])

    logger.warning("Validation error for {}: {}", request.url.path, exc.errors())

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=_error_body(
            code="VALIDATION_ERROR",
            message="Request validation failed",
            fields=fields,
        ),
    )

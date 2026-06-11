import logging
import traceback
from typing import Callable

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            return await call_next(request)
        except Exception as exc:
            # Log the exception
            logger.error(f"Unhandled exception: {exc}")
            logger.error(traceback.format_exc())

            # Determine the status code and error details
            status_code = 500
            error_code = "internal_server_error"
            message = "An internal server error occurred"
            fields = None

            # If it's a FastAPI HTTPException, we can extract status code and detail
            if hasattr(exc, "status_code"):
                status_code = exc.status_code
                # For HTTPException, the detail might be a string or a dict
                if hasattr(exc, "detail"):
                    if isinstance(exc.detail, dict):
                        # If detail is a dict, we might have error code and fields
                        error_code = exc.detail.get("code", error_code)
                        message = exc.detail.get("message", message)
                        fields = exc.detail.get("fields")
                    else:
                        message = str(exc.detail)
            # If it's a RequestValidationError, we can format the validation errors
            # But note: RequestValidationError is a subclass of HTTPException with status_code 422
            # We'll let the above handle it, but we can customize if needed.

            # Prepare the response content
            content = {
                "success": False,
                "data": None,
                "error": {
                    "code": error_code,
                    "message": message,
                },
            }
            if fields is not None:
                content["error"]["fields"] = fields

            return JSONResponse(
                status_code=status_code,
                content=content,
            )

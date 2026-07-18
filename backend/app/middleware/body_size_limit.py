"""Middleware that rejects requests with oversized JSON bodies."""

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse

_MAX_JSON_BYTES = 1 * 1024 * 1024  # 1 MB


class BodySizeLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        content_type = request.headers.get("content-type", "")

        # Only cap JSON bodies — file uploads are handled at the endpoint level
        if "application/json" in content_type:
            content_length = request.headers.get("content-length")
            if content_length and int(content_length) > _MAX_JSON_BYTES:
                return JSONResponse(
                    status_code=413,
                    content={
                        "success": False,
                        "data": None,
                        "error": {
                            "code": "PAYLOAD_TOO_LARGE",
                            "message": f"JSON body exceeds {_MAX_JSON_BYTES // (1024 * 1024)}MB limit",
                        },
                    },
                )

        return await call_next(request)

"""Request logging middleware — logs method, path, status, duration, request_id, user_id."""

import time
import uuid
from typing import Callable

from fastapi import Request, Response
from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        start = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - start) * 1000

        user_id = getattr(request.state, "user_id", None)
        log_fn = logger.warning if response.status_code >= 400 else logger.info

        log_fn(
            "{} {} {} {:.1f}ms request_id={} user_id={}",
            request.method,
            request.url.path,
            response.status_code,
            elapsed_ms,
            request_id,
            user_id or "-",
        )

        response.headers["X-Request-ID"] = request_id
        return response

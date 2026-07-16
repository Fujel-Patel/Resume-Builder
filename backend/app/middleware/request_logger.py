"""Request logging middleware — logs method, path, status, and duration."""

import time
from typing import Callable

from fastapi import Request, Response
from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - start) * 1000

        log_fn = logger.warning if response.status_code >= 400 else logger.info

        log_fn(
            "{} {} {} {:.1f}ms",
            request.method,
            request.url.path,
            response.status_code,
            elapsed_ms,
        )
        return response

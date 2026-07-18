"""Cache-Control middleware — sets appropriate caching headers per path."""

import re
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# (path_regex, Cache-Control value)
_CACHE_RULES: list[tuple[str, str]] = [
    # Health checks — always revalidate
    (r"^/health$", "no-cache"),
    (r"^/ready$", "no-cache"),
    # User profile — private, short TTL
    (r"^/api/v1/users/", "private, max-age=300"),
    # Resume list + dashboard — private, short TTL
    (r"^/api/v1/resumes$", "private, max-age=60"),
    (r"^/api/v1/resumes/", "private, max-age=60"),
    # AI settings — private, longer TTL
    (r"^/api/v1/settings/", "private, max-age=300"),
    # ATS history — private, short TTL
    (r"^/api/v1/ats/", "private, max-age=60"),
    # OpenAPI docs — long cache
    (r"^/api/v1/openapi\.json$", "public, max-age=3600"),
]

# Compiled patterns
_COMPILED_RULES = [(re.compile(pat), val) for pat, val in _CACHE_RULES]

# Default for unmatched API routes
_DEFAULT_CACHE = "no-store"


class CacheControlMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)

        path = request.url.path
        if not path.startswith("/api/"):
            return response

        # Skip if streaming (SSE) — don't add headers to streamed responses
        if response.headers.get("content-type", "").startswith("text/event-stream"):
            return response

        cache_control = _DEFAULT_CACHE
        for pattern, value in _COMPILED_RULES:
            if pattern.search(path):
                cache_control = value
                break

        response.headers["Cache-Control"] = cache_control
        return response

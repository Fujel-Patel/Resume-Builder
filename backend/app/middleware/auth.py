"""Auth middleware — attaches decoded user_id to request.state for optional use.

Routes that REQUIRE auth use get_current_user() dependency (raises 401).
This middleware is non-blocking: invalid/missing token just leaves state.user_id = None.
"""

from typing import Callable

import jwt
from fastapi import Request, Response
from jwt.exceptions import InvalidTokenError
from starlette.middleware.base import BaseHTTPMiddleware

from app.config.settings import settings


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request.state.user_id = None

        auth_header: str = request.headers.get("Authorization", "")
        if not auth_header:
            return await call_next(request)

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return await call_next(request)

        token = parts[1]
        try:
            payload = jwt.decode(
                token,
                settings.JWT_ACCESS_SECRET,   # FIX: was JWT_SECRET_KEY (doesn't exist)
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
            request.state.user_id = payload.get("sub")
        except InvalidTokenError:
            pass  # non-blocking — protected routes use dependency for enforcement

        return await call_next(request)

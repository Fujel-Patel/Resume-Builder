from typing import Callable

import jwt
from fastapi import Request, Response
from jwt.exceptions import InvalidTokenError
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import get_settings

settings = get_settings()


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Initialize user as None
        request.state.user = None

        # Get the Authorization header
        authorization: str = request.headers.get("Authorization")
        if not authorization:
            # No token, proceed without setting user
            return await call_next(request)

        # Check if the header is in the format "Bearer <token>"
        parts = authorization.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            # Invalid format, proceed without setting user
            return await call_next(request)

        token = parts[1]

        try:
            # Decode the JWT token
            payload = jwt.decode(
                token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
            )
            # Assuming the payload has a 'sub' field with the user ID or user object
            # We'll set the user from the payload. Adjust as per your token structure.
            request.state.user = payload.get("sub")  # or however you store user info
        except InvalidTokenError:
            # Invalid token, proceed without setting user
            pass

        # Continue to the next middleware or endpoint
        return await call_next(request)

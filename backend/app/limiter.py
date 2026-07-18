"""Shared SlowAPI rate limiter instance."""


from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address


def _get_real_ip(request: Request) -> str:
    """Extract real client IP behind reverse proxy (Render/Vercel/Cloudflare)."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return get_remote_address(request)


limiter = Limiter(key_func=_get_real_ip, default_limits=["100/minute"])

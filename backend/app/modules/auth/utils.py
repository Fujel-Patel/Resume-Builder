from fastapi import HTTPException


def raise_http_exception(exc: HTTPException):
    """Utility to raise a FastAPI HTTPException.
    This exists to keep router code concise; it simply raises the provided exception.
    """
    raise exc

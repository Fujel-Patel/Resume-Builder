"""Shared response models — PRD response shape enforced here."""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


class ErrorDetail(BaseModel):
    code: str
    message: str
    fields: Optional[Dict[str, List[str]]] = None


class APIResponse(BaseModel):
    """Standard API response envelope per PRD."""
    success: bool
    data: Optional[Any] = None
    error: Optional[ErrorDetail] = None

    model_config = ConfigDict(from_attributes=True)


def success(data: Any) -> dict:
    """Return PRD-compliant success response dict."""
    return {"success": True, "data": data, "error": None}


def error(code: str, message: str, fields: dict = None, status_code: int = 400):
    """Build error detail dict for HTTPException detail field."""
    detail = {"code": code, "message": message}
    if fields:
        detail["fields"] = fields
    return detail

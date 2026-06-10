"""Shared Pydantic base models used across the project.

The module defines common configuration for all Pydantic models, standard response
models, and error models used consistently throughout the API.
"""

from typing import Any, Dict, Optional, List

from pydantic import BaseModel, ConfigDict, Field


class BaseModelConfig(ConfigDict):
    """Configuration applied to all Pydantic models in the code base.

    * ``from_attributes=True`` enables compatibility with ORMs such as SQLAlchemy.
    * ``extra='forbid'`` prevents unexpected fields from being accepted, which
      helps catch bugs early.
    * ``str_strip_whitespace=True`` automatically strips whitespace from strings.
    """

    from_attributes: bool = True  # Replaces orm_mode in Pydantic v2
    extra: str = "forbid"
    # String validation - strip whitespace
    str_strip_whitespace: bool = True


class ErrorDetail(BaseModel):
    """Detailed error information for API error responses."""

    code: str = Field(..., description="Machine-readable error code")
    message: str = Field(..., description="Human-readable error message")
    fields: Optional[Dict[str, List[str]]] = Field(
        None,
        description="Field-specific errors for validation issues"
    )


class ResponseModel(BaseModel):
    """Base response model shared by API endpoints.

    Attributes
    ----------
    success: ``bool``
        Indicates whether the request was processed successfully.
    data: ``Any`` | ``None``
        The payload returned on success; its type is intentionally generic.
    error: ``ErrorDetail`` | ``None``
        Optional error information when ``success`` is ``False``.
    """

    success: bool
    data: Optional[Any] = None
    error: Optional[ErrorDetail] = None

    model_config = BaseModelConfig()


class BaseSchema(BaseModel):
    """Base schema for all request/response models.

    Provides common configuration and can be extended by specific schemas.
    """

    model_config = BaseModelConfig()


class TimestampMixin(BaseModel):
    """Mixin for models that include timestamp fields."""

    created_at: Optional[str] = Field(None, description="Creation timestamp")
    updated_at: Optional[str] = Field(None, description="Last update timestamp")

    model_config = BaseModelConfig()
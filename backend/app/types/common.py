"""Shared Pydantic base models used across the project.

The module defines a common configuration dictionary for all response models and a
lightweight ``ResponseModel`` that can be subclassed by endpoint return types.
"""

from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


class BaseModelConfig(ConfigDict):
    """Configuration applied to all Pydantic models in the code base.

    * ``orm_mode=True`` enables compatibility with ORMs such as SQLAlchemy.
    * ``extra='forbid'`` prevents unexpected fields from being accepted, which
      helps catch bugs early.
    """

    orm_mode: bool = True
    extra: str = "forbid"


class ResponseModel(BaseModel):
    """Base response model shared by API endpoints.

    Attributes
    ----------
    success: ``bool``
        Indicates whether the request was processed successfully.
    data: ``Any`` | ``None``
        The payload returned on success; its type is intentionally generic.
    error: ``dict`` | ``None``
        Optional error information when ``success`` is ``False``.
    """

    success: bool
    data: Optional[Any] = None
    error: Optional[Dict[str, Any]] = None

    model_config = BaseModelConfig()

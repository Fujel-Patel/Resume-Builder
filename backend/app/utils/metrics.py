"""Structured performance metrics for AI requests."""

import json
import time
from dataclasses import dataclass, fields

from loguru import logger


@dataclass
class AIRequestMetrics:
    provider: str
    model: str
    ai_latency_ms: float
    input_tokens: int = 0
    output_tokens: int = 0
    json_parse_latency_ms: float = 0.0
    db_save_latency_ms: float = 0.0
    total_duration_ms: float = 0.0
    endpoint: str = ""
    success: bool = True
    error: str = ""


def log_ai_metrics(m: AIRequestMetrics):
    filtered = {f.name: getattr(m, f.name) for f in fields(m) if getattr(m, f.name)}
    logger.info("AI_METRICS {}", json.dumps(filtered))


class Timer:
    __slots__ = ("_start",)
    def __init__(self): self._start = time.perf_counter()
    def elapsed_ms(self) -> float: return (time.perf_counter() - self._start) * 1000

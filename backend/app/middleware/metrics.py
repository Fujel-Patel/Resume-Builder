"""Prometheus metrics middleware — request count, latency histogram, in-progress gauge."""

import time
from typing import Callable

from fastapi import Request, Response
from prometheus_client import CollectorRegistry, Counter, Histogram, Gauge, generate_latest
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import PlainTextResponse

# Create app-level registry (isolated from default metrics)
REGISTRY = CollectorRegistry()

REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "path", "status"],
    registry=REGISTRY,
)

REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency in seconds",
    ["method", "path"],
    buckets=(0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0),
    registry=REGISTRY,
)

REQUESTS_IN_PROGRESS = Gauge(
    "http_requests_in_progress",
    "Number of HTTP requests currently in progress",
    ["method"],
    registry=REGISTRY,
)


def metrics_endpoint() -> PlainTextResponse:
    return PlainTextResponse(
        generate_latest(REGISTRY),
        media_type="text/plain; version=0.0.4; charset=utf-8",
    )


def _normalise_path(path: str) -> str:
    """Replace path params with placeholders to avoid high-cardinality labels."""
    parts = path.strip("/").split("/")
    normalised = []
    for part in parts:
        if part in ("api", "v1"):
            normalised.append(part)
        elif len(part) == 36 and "-" in part:
            normalised.append("{id}")
        elif part.isdigit():
            normalised.append("{id}")
        else:
            normalised.append(part)
    return "/" + "/".join(normalised)


class PrometheusMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        path = _normalise_path(request.url.path)
        method = request.method

        REQUESTS_IN_PROGRESS.labels(method=method).inc()
        start = time.perf_counter()

        try:
            response = await call_next(request)
        except Exception:
            REQUEST_COUNT.labels(method=method, path=path, status="500").inc()
            raise
        finally:
            REQUESTS_IN_PROGRESS.labels(method=method).dec()

        elapsed = time.perf_counter() - start
        REQUEST_COUNT.labels(method=method, path=path, status=str(response.status_code)).inc()
        REQUEST_LATENCY.labels(method=method, path=path).observe(elapsed)

        return response

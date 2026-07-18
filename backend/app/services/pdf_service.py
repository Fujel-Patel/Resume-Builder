"""Playwright-based PDF generation service.

Launches headless Chromium, renders a self-contained HTML string,
and returns A4 PDF bytes.

A lock ensures only one coroutine launches or uses the browser at a time,
preventing race conditions under concurrent requests.
"""

from __future__ import annotations

import asyncio

from loguru import logger

_BROWSER_LOCK = asyncio.Lock()
_BROWSER = None


async def _get_browser():
    """Lazily launch a persistent Chromium instance (reused across calls).

    The lock prevents two coroutines from both seeing ``_BROWSER is None``
    and launching duplicate instances.
    """
    global _BROWSER  # noqa: PLW0603
    async with _BROWSER_LOCK:
        if _BROWSER is None or not _BROWSER.is_connected():
            from playwright.async_api import async_playwright

            p = await async_playwright().start()
            _BROWSER = await p.chromium.launch(
                headless=True,
                args=[
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                ],
            )
    return _BROWSER


async def generate_pdf(
    html_content: str,
    *,
    timeout_ms: int = 30000,
) -> bytes:
    """Render a complete HTML document to A4 PDF bytes using Playwright.

    Parameters
    ----------
    html_content:
        Fully self-contained HTML document (inline CSS, fonts loaded via @import).
    timeout_ms:
        Maximum time to wait for the page to reach ``networkidle`` (default 30 s).

    Returns
    -------
    Raw PDF bytes ready to serve as ``application/pdf``.
    """
    browser = await _get_browser()
    context = await browser.new_context(
        viewport={"width": 794, "height": 1123},
        device_scale_factor=2,
        locale="en-US",
    )
    page = await context.new_page()

    try:
        await page.set_content(html_content, wait_until="networkidle", timeout=timeout_ms)

        pdf_bytes = await page.pdf(
            format="A4",
            print_background=True,
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
            prefer_css_page_size=True,
        )
    finally:
        await page.close()
        await context.close()

    return pdf_bytes


async def shutdown_browser() -> None:
    """Cleanup — call on application shutdown."""
    global _BROWSER  # noqa: PLW0603
    async with _BROWSER_LOCK:
        if _BROWSER:
            try:
                await _BROWSER.close()
            except Exception:
                logger.warning("Browser close error (ignored)")
            finally:
                _BROWSER = None

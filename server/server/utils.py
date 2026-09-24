"""Utility functions for WayPoint Logistics server.

This module contains custom exception handlers and utility functions
for the Django REST Framework application.
"""
import logging

from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """Custom exception handler for Django REST Framework.

    Keeps error bodies in the shapes the client parses (`detail`, `error`, or
    `errors` as a list/field map) and never includes exception text or stack
    traces; those are logged server-side instead.

    Args:
        exc: The exception that was raised
        context: The context in which the exception occurred

    Returns:
        Response: The exception response, or None for unhandled exceptions
    """
    response = exception_handler(exc, context)

    if response is None:
        view = context.get('view')
        logger.exception("Unhandled exception in %s", type(view).__name__ if view else 'view', exc_info=exc)
        return None

    # A bare list (e.g. from `raise ValidationError("...")`) is wrapped so the
    # body is always an object.
    if isinstance(response.data, list):
        response.data = {"errors": response.data}

    return response

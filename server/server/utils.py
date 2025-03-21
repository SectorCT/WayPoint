from rest_framework.views import exception_handler
import traceback
from django.conf import settings

def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    # Add extra info in DEBUG mode:
    if response is not None and settings.DEBUG:
        response.data['exception'] = str(exc)
        response.data['trace'] = traceback.format_exc()

    return response

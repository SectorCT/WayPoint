"""Role checks and company helpers shared by the authentication and delivery apps.

Every API view is behind `IsAuthenticated` by default (see `REST_FRAMEWORK` in
settings); these classes narrow a view down to managers or truckers.
"""
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission


class IsManager(BasePermission):
    """Authenticated manager (or superuser)."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        return bool(getattr(user, 'is_superuser', False) or getattr(user, 'isManager', False))


class IsTrucker(BasePermission):
    """Authenticated non-manager user."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and not getattr(user, 'isManager', False))


def get_user_company(user):
    """Return the company a user belongs to, or None.

    Truckers (and seeded managers) have `user.company`; a manager may only be
    linked through the `Company.manager` one-to-one (`managed_company`).
    """
    company = getattr(user, 'company', None)
    if company is not None:
        return company
    try:
        return user.managed_company
    except Exception:
        return None


def ensure_own_username(request, username):
    """Reject a trucker request that names a different driver than the caller.

    Trucker endpoints historically took the driver's username from the request;
    it is still accepted for compatibility but must match the authenticated user.
    """
    if username and username != request.user.username:
        raise PermissionDenied("You can only access your own route.")
    return request.user


def ensure_same_company(manager, user):
    """Raise 403 unless `user` belongs to the manager's company."""
    company = get_user_company(manager)
    if company is None or user.company_id != company.id:
        raise PermissionDenied("This user does not belong to your company.")

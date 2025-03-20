from rest_framework.permissions import BasePermission

class IsManager(BasePermission):
    def has_permission(self, request, view):
        print(f"User Authenticated: {request.user.is_authenticated}")  # Debug
        print(f"User: {request.user}")  # Debug
        print(f"User is_superuser: {getattr(request.user, 'is_superuser', None)}")  # Debug
        print(f"User isManager: {getattr(request.user, 'isManager', None)}")  # Debug

        if request.user and request.user.is_authenticated:
            if getattr(request.user, "is_superuser", False):
                print("User is superuser, permission granted")  # Debug
                return True
            if getattr(request.user, "isManager", False):
                print("User is manager, permission granted")  # Debug
                return True
            print("User is neither superuser nor manager, permission denied")  # Debug
            return False
        
        print("User is not authenticated, permission denied")  # Debug
        return False
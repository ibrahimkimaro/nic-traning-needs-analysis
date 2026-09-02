from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

class EmailOrUsernameBackend(ModelBackend):
    """
    Custom authentication backend that allows users to log in using
    either their username or their email address.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            return None

        try:
            # Try to find user by username first, then by email
            user = User.objects.filter(Q(username=username) | Q(email=username)).first()
        except Exception:
            return None

        if user and user.check_password(password) and user.is_active:
            return user
        return None

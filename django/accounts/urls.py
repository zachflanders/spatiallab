from django.urls import path
from .views import (
    signup_view,
    activate_view,
    login_view,
    logout_view,
    is_authenticated_view,
    resend_activation_view,
)

urlpatterns = [
    path("signup/", signup_view, name="signup"),
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),
    path("is_authenticated/", is_authenticated_view, name="is_authenticated"),
    path("activate/<uid>/<token>/", activate_view, name="activate"),
    path("resend_activation/", resend_activation_view, name="resend_activation"),
]

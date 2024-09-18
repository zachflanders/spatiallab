from django.urls import path
from .views import (
    signup_view,
    activate_view,
    login_view,
    IsAuthenticatedJWTView,
    resend_activation_view,
    WaitlistCreateView,
    password_reset_request_view,
    password_reset_confirm_view,
)

urlpatterns = [
    path("signup/", signup_view, name="signup"),
    path("login/", login_view, name="login"),
    path(
        "is_authenticated/", IsAuthenticatedJWTView.as_view(), name="is_authenticated"
    ),
    path("activate/<uid>/<token>/", activate_view, name="activate"),
    path("resend_activation/", resend_activation_view, name="resend_activation"),
    path("waitlist/", WaitlistCreateView.as_view(), name="waitlist"),
    path("password-reset/", password_reset_request_view, name="password-reset"),
    path(
        "password-reset-confirm/<uid>/<token>/",
        password_reset_confirm_view,
        name="password-reset-confirm",
    ),
]

import json
import logging
from django.conf import settings
from django.contrib.auth import login, logout, authenticate, get_user_model
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.tokens import default_token_generator
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import send_mail
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.urls import reverse
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from .serializers import WaitlistSerializer
from .forms import UserCreationForm
from .token_generator import custom_token_generator

logger = logging.getLogger(__name__)

User = get_user_model()


def send_activation_email(user, request):
    current_site = get_current_site(request)
    mail_subject = "Activate your SpatialLab account"
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = custom_token_generator.make_token(user)
    activation_url = f"http://{current_site.domain}/verify?uid={uid}&token={token}"
    message = render_to_string(
        "acc_activate_email.html",
        {
            "user": user,
            "activation_url": activation_url,
        },
    )
    send_mail(
        mail_subject,
        message,
        "adming@spatiallab.app",
        [user.email],
        html_message=message,
    )


def signup_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        logger.info("Data: %s", data)

        if data.get("code") != settings.EARLY_ACCESS_CODE:
            return JsonResponse({"error": "Invalid code"}, status=400)
        logger.info("Code is valid")

        form = UserCreationForm(
            {
                "email": data.get("email"),
                "password1": data.get("password1"),
                "password2": data.get("password2"),
            }
        )

        if form.is_valid():
            user = form.save()
            send_activation_email(user, request)
            login(request, user)
            return JsonResponse(
                {
                    "success": True,
                    "message": "Please confirm your email address to complete the registration.",
                }
            )
        return JsonResponse({"errors": form.errors}, status=400)


def activate_view(request, uid, token):
    try:
        uid = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    if user is not None and custom_token_generator.check_token(user, token):
        user.is_verified = True
        user.save()
        login(request, user)
        return JsonResponse({"success": True, "message": "Account activated"})
    return JsonResponse({"error": "Invalid activation link"}, status=400)


def resend_activation_view(request):
    if request.method == "POST":
        email = request.POST.get("email")
        try:
            user = User.objects.get(email=email)
            print(user)
            print(email)
            if user.is_verified:
                return JsonResponse(
                    {"success": False, "message": "Account is already verified"},
                    status=400,
                )
            send_activation_email(user, request)
            return JsonResponse({"success": True, "message": "Verification email sent"})
        except User.DoesNotExist:
            return JsonResponse(
                {"success": False, "message": "User with this email does not exist"},
                status=400,
            )
    return JsonResponse(
        {"success": False, "message": "Invalid request method"}, status=400
    )


def login_view(request):
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")
        user = authenticate(request, email=email, password=password)
        print(user)
        if user is not None:
            login(request, user)
            return JsonResponse({"success": True})
        return JsonResponse({"error": "Invalid credentials"}, status=400)


class IsAuthenticatedJWTView(APIView):
    """
    A view to check if the user is authenticated based on the JWT token.
    """

    permission_classes = [
        IsAuthenticated
    ]  # This ensures the user is authenticated with JWT

    def get(self, request):
        """
        Returns user data if the JWT token is valid.
        """
        user = (
            request.user
        )  # This will only be accessible if the user is authenticated by the JWT

        return Response(
            {
                "is_authenticated": True,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
            },
            status=status.HTTP_200_OK,
        )


class WaitlistCreateView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = WaitlistSerializer(data=request.data)
        if serializer.is_valid():
            waitlist_entry = serializer.save()
            subject = "Spatial Lab waitlist confirmation"
            message = f"Hi {waitlist_entry.email},\n\nThank you for joining the Spatial Lab waitlist.  I really appreciate your support. Together, we'll put Spatial Lab on the map!\n\nBest regards,\nZach"
            from_email = "zachflanders@gmail.com"  # Replace with your email
            recipient_list = [waitlist_entry.email]

            send_mail(subject, message, from_email, recipient_list)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

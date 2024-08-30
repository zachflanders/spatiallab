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
from django.views.decorators.csrf import csrf_exempt

from .forms import UserCreationForm
from .token_generator import custom_token_generator

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


@csrf_exempt
def signup_view(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
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


@csrf_exempt
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


@csrf_exempt
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


@csrf_exempt
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


def logout_view(request):
    logout(request)
    return JsonResponse({"success": True})


def is_authenticated_view(request):
    is_authenticated = request.user.is_authenticated
    return JsonResponse({"is_authenticated": is_authenticated})

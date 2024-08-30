from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import UserCreationForm
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from django.contrib.auth.decorators import login_required

from .forms import UserCreationForm

@csrf_exempt
def signup_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return JsonResponse({"success": True})
        return JsonResponse({"errors": form.errors}, status=400)

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({"success": True})
        return JsonResponse({"error": "Invalid credentials"}, status=400)

def logout_view(request):
    logout(request)
    return JsonResponse({"success": True})



def is_authenticated_view(request):
    is_authenticated = request.user.is_authenticated
    return JsonResponse({'is_authenticated': is_authenticated})

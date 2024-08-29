from django.urls import path
from .views import signup_view, login_view, logout_view, is_authenticated_view

urlpatterns = [
    path('signup/', signup_view, name='signup'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('is_authenticated/', is_authenticated_view, name='is_authenticated'),
]

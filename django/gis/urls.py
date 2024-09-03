from django.urls import path
from .views import upload_file, LayerListView, LayerDetailView

urlpatterns = [
    path("upload/", upload_file, name="upload"),
    path("layers/", LayerListView.as_view(), name="layer-list"),
    path("layer/<int:pk>/", LayerDetailView.as_view(), name="layer-detail"),
]

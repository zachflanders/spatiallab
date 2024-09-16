from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LayerListView,
    LayerDetailView,
    ProjectViewSet,
    ProjectLayerViewSet,
    FileUploadView,
    DirectoryViewSet,
)

router = DefaultRouter()
router.register(r"projects", ProjectViewSet, basename="project")
router.register(r"project-layers", ProjectLayerViewSet, basename="project-layer")
router.register(r"directories", DirectoryViewSet, basename="directory")


urlpatterns = [
    path("upload/", FileUploadView.as_view(), name="upload"),
    path("layers/", LayerListView.as_view(), name="layer-list"),
    path("layer/<int:pk>/", LayerDetailView.as_view(), name="layer-detail"),
    path("", include(router.urls)),
]

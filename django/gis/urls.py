from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LayerListView,
    LayerDetailView,
    ProjectViewSet,
    ProjectLayerViewSet,
    FileUploadView,
    DirectoryViewSet,
    ExportLayerAsGeoJSON,
    GenerateSignedUrlView,
    StartIngestTaskView,
    CheckTaskStatusView,
    move_model_up,
    move_model_down,
)

router = DefaultRouter()
router.register(r"projects", ProjectViewSet, basename="project")
router.register(r"project-layers", ProjectLayerViewSet, basename="project-layer")
router.register(r"directories", DirectoryViewSet, basename="directory")


urlpatterns = [
    path("upload/", FileUploadView.as_view(), name="upload"),
    path("layers/", LayerListView.as_view(), name="layer-list"),
    path("layer/<int:pk>/", LayerDetailView.as_view(), name="layer-detail"),
    path(
        "export/layer/<int:layer_id>/",
        ExportLayerAsGeoJSON.as_view(),
        name="export_layer_geojson",
    ),
    path("", include(router.urls)),
    path(
        "generate-signed-url/",
        GenerateSignedUrlView.as_view(),
        name="generate-signed-url",
    ),
    path("start-ingest-task/", StartIngestTaskView.as_view(), name="start-ingest-task"),
    path(
        "check-task-status/<str:task_id>/",
        CheckTaskStatusView.as_view(),
        name="check-task-status",
    ),
    path("project-layer/<int:pk>/move-up/", move_model_up, name="move_model_up"),
    path("project-layer/<int:pk>/move-down/", move_model_down, name="move_model_down"),
]

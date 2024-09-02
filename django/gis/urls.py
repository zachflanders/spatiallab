from django.urls import path
from .views import upload_file, layer_view, layers_view

urlpatterns = [
    path("upload/", upload_file, name="upload"),
    path("layer/<layer_id>/", layer_view, name="layer"),
    path("layers/", layers_view, name="layers"),
]

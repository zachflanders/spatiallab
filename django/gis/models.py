from django.db import models
from django.contrib.gis.db import models as gis_models
from django.conf import settings


class Layer(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=255)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="layers"
    )

    def __str__(self):
        return self.name


class Feature(gis_models.Model):
    name = models.CharField(max_length=255)
    geometry = gis_models.GeometryField()
    layer = models.ForeignKey(Layer, on_delete=models.CASCADE, related_name="features")

    def __str__(self):
        return self.name


class Property(models.Model):
    key = models.CharField(max_length=255)
    value = models.TextField(null=True, blank=True)
    feature = models.ForeignKey(
        Feature, on_delete=models.CASCADE, related_name="properties"
    )

    def __str__(self):
        return f"{self.key}: {self.value}"

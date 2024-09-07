from django.db import models
from django.contrib.gis.db import models as gis_models
from django.conf import settings
from django.contrib.postgres.fields import ArrayField


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


class Project(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="projects"
    )
    extent = ArrayField(models.FloatField(), size=4, null=True, blank=True)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name


class ProjectLayer(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="project_layers"
    )
    layer = models.ForeignKey(
        Layer, on_delete=models.CASCADE, related_name="project_layers"
    )
    style = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"Project: {self.project.name}, Layer: {self.layer.name}"

import json
from datetime import datetime
from django.db import models
from django.contrib.gis.db import models as gis_models
from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from ordered_model.models import OrderedModel


class Directory(models.Model):
    name = models.CharField(max_length=255)
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        related_name="subdirectories",
        null=True,
        blank=True,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="directories"
    )

    def __str__(self):
        return self.name


class Layer(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=255)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="layers"
    )
    directory = models.ForeignKey(
        Directory,
        on_delete=models.CASCADE,
        related_name="layers",
        null=True,
        blank=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["name", "user"],
                condition=models.Q(directory__isnull=True),
                name="unique_name_user_when_directory_is_null",
            ),
            models.UniqueConstraint(
                fields=["name", "user", "directory"], name="unique_name_user_directory"
            ),
        ]

    def __str__(self):
        return self.name


class LayerFeature(gis_models.Model):
    geometry = gis_models.GeometryField()
    layer = models.ForeignKey(Layer, on_delete=models.CASCADE, related_name="features")
    properties = models.JSONField()

    def __str__(self):
        return f"Feature in {self.layer.name}"


class LayerProperty(models.Model):
    LAYER_PROPERTY_TYPES = [
        ("string", "String"),
        ("integer", "Integer"),
        ("float", "Float"),
        ("boolean", "Boolean"),
        ("date", "Date"),
        ("datetime", "DateTime"),
        ("category", "Category"),
        ("json", "JSON"),
    ]

    layer = models.ForeignKey(
        Layer, on_delete=models.CASCADE, related_name="properties"
    )
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50, choices=LAYER_PROPERTY_TYPES)

    def __str__(self):
        return self.name


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


class ProjectLayerGroup(models.Model):
    name = models.CharField(max_length=255)
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        related_name="subgroups",
        null=True,
        blank=True,
    )
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="layer_groups"
    )

    def __str__(self):
        return self.name


class ProjectLayer(OrderedModel):
    BASEMAP_CHOICES = [
        ("osm", "OpenStreetMap"),
        ("satellite", "Satellite"),
    ]
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="project_layers"
    )
    layer = models.ForeignKey(
        Layer,
        on_delete=models.CASCADE,
        related_name="project_layers",
        null=True,
        blank=True,
    )
    group = models.ForeignKey(
        ProjectLayerGroup,
        on_delete=models.CASCADE,
        related_name="project_layers",
        null=True,
        blank=True,
    )
    style = models.JSONField(null=True, blank=True)
    basemap = models.CharField(
        max_length=50, choices=BASEMAP_CHOICES, null=True, blank=True
    )
    visible = models.BooleanField(default=True)

    order_with_respect_to = "project"

    class Meta(OrderedModel.Meta):
        ordering = ["order"]

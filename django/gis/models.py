import json
from datetime import datetime
from django.db import models
from django.contrib.gis.db import models as gis_models
from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.core.exceptions import ValidationError


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

    def __str__(self):
        return self.name


class LayerFeature(gis_models.Model):
    geometry = gis_models.GeometryField()
    layer = models.ForeignKey(Layer, on_delete=models.CASCADE, related_name="features")

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


class FeaturePropertyValue(models.Model):
    property = models.ForeignKey(
        LayerProperty, on_delete=models.CASCADE, related_name="property_values"
    )
    feature = models.ForeignKey(
        LayerFeature, on_delete=models.CASCADE, related_name="feature_values"
    )
    value = models.TextField(null=True, blank=True)
    allowed_categories = models.TextField(
        null=True,
        blank=True,
        help_text="Comma-separated list of allowed categories for 'category' type",
    )

    def clean(self):
        property_type = self.property.type
        value = self.value

        # String validation (default behavior of TextField)
        if property_type == "string":
            if not isinstance(value, str):
                raise ValidationError("Value must be a string.")

        # Integer validation
        elif property_type == "integer":
            try:
                int(value)
            except (ValueError, TypeError):
                raise ValidationError("Value must be an integer.")

        # Float (decimal) validation
        elif property_type == "float":
            try:
                float(value)
            except (ValueError, TypeError):
                raise ValidationError("Value must be a float.")

        # Boolean validation
        elif property_type == "boolean":
            if value.lower() not in ["true", "false", "1", "0"]:
                raise ValidationError("Value must be a boolean (true/false).")

        # Date validation
        elif property_type == "date":
            try:
                datetime.strptime(value, "%Y-%m-%d")  # Check format YYYY-MM-DD
            except (ValueError, TypeError):
                raise ValidationError("Value must be a date in YYYY-MM-DD format.")

        # DateTime validation
        elif property_type == "datetime":
            try:
                datetime.strptime(
                    value, "%Y-%m-%d %H:%M:%S"
                )  # Check format YYYY-MM-DD HH:MM:SS
            except (ValueError, TypeError):
                raise ValidationError(
                    "Value must be a datetime in YYYY-MM-DD HH:MM:SS format."
                )

        # Category (enum) validation
        elif property_type == "category" and not self.allowed_categories:
            raise ValidationError(
                "Allowed categories must be provided for 'category' type."
            )

        elif property_type == "category":
            allowed_categories = [
                category.strip()
                for category in self.property.allowed_categories.split(",")
            ]
            if value not in allowed_categories:
                raise ValidationError(
                    f"Value must be one of the allowed categories: {', '.join(allowed_categories)}."
                )

        # JSON validation
        elif property_type == "json":
            try:
                json.loads(value)  # Check if it's a valid JSON string
            except (ValueError, TypeError):
                raise ValidationError("Value must be a valid JSON string.")

    def __str__(self):
        return f"Value for {self.property.name}: {self.value}"


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


class ProjectLayer(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="project_layers"
    )
    layer = models.ForeignKey(
        Layer, on_delete=models.CASCADE, related_name="project_layers"
    )
    group = models.ForeignKey(
        ProjectLayerGroup,
        on_delete=models.CASCADE,
        related_name="project_layers",
        null=True,
        blank=True,
    )
    style = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"Project: {self.project.name}, Layer: {self.layer.name}"

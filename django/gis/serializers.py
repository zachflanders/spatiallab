# serializers.py
from rest_framework import serializers
from .models import Layer, Project, ProjectLayer


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ["owner"]

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["owner"] = request.user
        return super().create(validated_data)


class ProjectLayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectLayer
        fields = "__all__"


class LayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Layer
        fields = "__all__"


class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, value):
        # You can add custom validation here if necessary
        if not value.name.endswith((".zip", ".geojson")):
            raise serializers.ValidationError("Unsupported file type.")
        return value

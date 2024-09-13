# serializers.py
from rest_framework import serializers
from .models import Layer, Project, ProjectLayer


class LayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Layer
        fields = "__all__"


class ProjectLayerSerializer(serializers.ModelSerializer):
    layer = LayerSerializer(read_only=True)
    layer_id = serializers.PrimaryKeyRelatedField(
        queryset=Layer.objects.all(), source="layer", write_only=True
    )

    class Meta:
        model = ProjectLayer
        fields = "__all__"


class ProjectSerializer(serializers.ModelSerializer):
    project_layers = ProjectLayerSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ["owner"]

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["owner"] = request.user
        return super().create(validated_data)


class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, value):
        # You can add custom validation here if necessary
        if not value.name.endswith((".zip", ".geojson")):
            raise serializers.ValidationError("Unsupported file type.")
        return value

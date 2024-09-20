# serializers.py
from rest_framework import serializers
from .models import Layer, Project, ProjectLayer, Directory


class LayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Layer
        fields = "__all__"


class ProjectLayerSerializer(serializers.ModelSerializer):
    layer = LayerSerializer(read_only=True)
    layer_id = serializers.PrimaryKeyRelatedField(
        queryset=Layer.objects.all(),
        source="layer",
        write_only=True,
        allow_null=True,
        required=False,
    )

    class Meta:
        model = ProjectLayer
        fields = "__all__"

    def create(self, validated_data):
        if "order" not in validated_data:
            validated_data["order"] = ProjectLayer.objects.count() + 1
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "order" not in validated_data:
            validated_data["order"] = instance.order
        return super().update(instance, validated_data)


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


class DirectorySerializer(serializers.ModelSerializer):
    subdirectories = serializers.SerializerMethodField()
    layers = serializers.SerializerMethodField()

    class Meta:
        model = Directory
        fields = ["id", "name", "parent", "user", "subdirectories", "layers"]
        read_only_fields = ["user"]

    def get_subdirectories(self, obj):
        return DirectorySerializer(
            obj.subdirectories.all().order_by("name"), many=True, context=self.context
        ).data

    def get_layers(self, obj):
        return LayerSerializer(
            obj.layers.all().order_by("name"), many=True, context=self.context
        ).data

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["user"] = request.user
        return super().create(validated_data)

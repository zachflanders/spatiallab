import json
import logging
import uuid
from pathlib import Path

import requests
from django.conf import settings
from django.db import connection
from django.contrib.gis.db.models import Extent
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.http import JsonResponse
from google.cloud import storage
from pyproj import Transformer
from requests.auth import HTTPBasicAuth
from rest_framework import generics, viewsets
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from gis.models import Property, Feature, Layer, Project, ProjectLayer
from gis.serializers import (
    LayerSerializer,
    ProjectSerializer,
    ProjectLayerSerializer,
    FileUploadSerializer,
)
from gis.tasks import ingest_file_to_db_task
from gis.permissions import IsOwner


logger = logging.getLogger(__name__)


class GeoServerIngestor:

    def __init__(
        self,
        layer_id: int,
        geoserver_url: str = "http://geoserver:8080/geoserver",
        workspace_name: str = "spatiallab",
        username: str = "admin",
        password: str = "password",
    ) -> None:
        self.layer_id = layer_id
        self.geoserver_url = geoserver_url
        self.workspace_name = workspace_name
        self.workspace_url = f"{self.geoserver_url}/rest/workspaces"
        self.store_name = f"layer_{self.layer_id}_store"
        self.datastore_url = (
            f"{self.geoserver_url}/rest/workspaces/{self.workspace_name}/datastores"
        )
        self.layer_name = f"layer_{self.layer_id}_features"
        self.username = username
        self.password = password

    def create_feature_view(self) -> None:
        view_name = f"layer_{self.layer_id}_features"
        with connection.cursor() as cursor:
            cursor.execute(
                f"""
                CREATE OR REPLACE VIEW {view_name} AS
                SELECT f.id, f.geometry, l.name AS layer_name
                FROM gis_feature f
                JOIN gis_layer l ON f.layer_id = l.id
                WHERE f.layer_id = %s
            """,
                [self.layer_id],
            )

    def create_workspace(self) -> None:
        logger.info("Creating workspace")
        logger.info(f"Workspace URL: {self.workspace_url}")
        response = requests.get(
            f"{self.workspace_url}/{self.workspace_name}",
            auth=HTTPBasicAuth(self.username, self.password),
        )
        logger.info(f"Workspace response: {response.status_code}")
        if response.status_code == 404:
            workspace_data = f"""
            <workspace>
                <name>{self.workspace_name}</name>
            </workspace>
            """
            requests.post(
                self.workspace_url,
                data=workspace_data,
                headers={"Content-Type": "text/xml"},
                auth=HTTPBasicAuth(self.username, self.password),
            )

    def create_datastore(self) -> None:
        datastore_data = f"""
        <dataStore>
        <name>{self.store_name}</name>
        <connectionParameters>
            <host>{settings.DB_HOST}</host>
            <port>{settings.DB_PORT}</port>
            <database>{settings.DB_Name}</database>
            <user>{settings.DB_USER}</user>
            <passwd>{settings.DB_PASSWORD}</passwd>
            <dbtype>postgis</dbtype>
            <schema>public</schema>
        </connectionParameters>
        </dataStore>
        """
        requests.post(
            self.datastore_url,
            data=datastore_data,
            headers={"Content-Type": "text/xml"},
            auth=HTTPBasicAuth(self.username, self.password),
        )

    def create_feature_layer(self) -> None:
        layer_url = f"{self.datastore_url}/{self.store_name}/featuretypes"
        layer_data = f"""
        <featureType>
        <name>{self.layer_name}</name>
        <nativeName>{self.layer_name}</nativeName>
        <srs>EPSG:4326</srs>  
        </featureType>
        """
        requests.post(
            layer_url,
            data=layer_data,
            headers={"Content-Type": "text/xml"},
            auth=HTTPBasicAuth(self.username, self.password),
        )


class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        if serializer.is_valid():
            file = serializer.validated_data["file"]
            logger.info("Uploading file to GCS")

            # Google Cloud Storage upload
            client = storage.Client(credentials=settings.GCS_CREDENTIALS)
            bucket = client.bucket(settings.GCS_BUCKET_NAME)
            file_path = Path(file.name)
            file_name = f"{file_path.stem}_{uuid.uuid4()}{file_path.suffix}"
            blob = bucket.blob(file_name)
            blob.upload_from_file(file)

            gcs_path = f"gs://{bucket.name}/{file_name}"
            logger.info(f"File uploaded to GCS: {gcs_path}")

            # Call async task to ingest file into DB
            layer_id = ingest_file_to_db_task(gcs_path, file_name, request.user.email)

            # Initialize GeoServerIngestor
            geoserver_ingestor = GeoServerIngestor(
                layer_id=layer_id,
                geoserver_url=settings.GEOSERVER_URL,
                workspace_name="spatiallab",
                username=settings.GEOSERVER_ADMIN_USER,
                password=settings.GEOSERVER_ADMIN_PASSWORD,
            )

            # Create GeoServer resources
            geoserver_ingestor.create_feature_view()
            geoserver_ingestor.create_workspace()
            geoserver_ingestor.create_datastore()
            geoserver_ingestor.create_feature_layer()

            return Response(
                {"layer_id": layer_id, "message": "File uploaded successfully"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LayerListView(generics.ListAPIView):
    serializer_class = LayerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.layers.all()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"layers": serializer.data})


class LayerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LayerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.layers.all()

    def retrieve(self, request, *args, **kwargs):
        layer = self.get_object()
        layer_id = layer.id

        unique_keys = (
            Property.objects.filter(feature__layer__id=layer_id)
            .values_list("key", flat=True)
            .distinct()
        )
        extent = Feature.objects.filter(layer__id=layer_id).aggregate(
            Extent("geometry")
        )["geometry__extent"]
        if extent:
            minx = float(extent[0])
            maxx = float(extent[2])
            miny = float(extent[1])
            maxy = float(extent[3])
            minx, maxx = min(minx, maxx), max(minx, maxx)
            miny, maxy = min(miny, maxy), max(miny, maxy)
            if minx < -180 or minx > 180 or maxx < -180 or maxx > 180:
                logger.error(
                    "Longitude values are out of range. Adjusting to valid range."
                )
                minx = max(min(minx, 180), -180)
                maxx = max(min(maxx, 180), -180)
            if miny < -90 or miny > 90 or maxy < -90 or maxy > 90:
                logger.error(
                    "Latitude values are out of range. Adjusting to valid range."
                )
                miny = max(min(miny, 90), -90)
                maxy = max(min(maxy, 90), -90)
            transformer = Transformer.from_crs("EPSG:4326", "EPSG:3857", always_xy=True)
            minx, miny = transformer.transform(minx, miny)
            maxx, maxy = transformer.transform(maxx, maxy)
            transformed_extent = [minx, miny, maxx, maxy]
        else:
            transformed_extent = None

        page = request.GET.get("page", 1)
        page_size = request.GET.get("page_size", 10)
        features = Feature.objects.filter(layer__id=layer_id).prefetch_related(
            "properties"
        )
        paginator = Paginator(features, page_size)

        try:
            features_page = paginator.page(page)
        except PageNotAnInteger:
            features_page = paginator.page(1)
        except EmptyPage:
            features_page = paginator.page(paginator.num_pages)

        table_data = [
            {
                "Feature ID": feature.id,
                **{
                    key: next(
                        (
                            prop.value
                            for prop in feature.properties.all()
                            if prop.key == key
                        ),
                        None,
                    )
                    for key in unique_keys
                },
            }
            for feature in features_page
        ]

        return Response(
            {
                "headers": list(unique_keys),
                "data": table_data,
                "extent": transformed_extent,
                "page": features_page.number,
                "page_size": page_size,
                "total_pages": paginator.num_pages,
                "total_features": paginator.count,
            }
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)


class ProjectLayerViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectLayerSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        return ProjectLayer.objects.filter(project__owner=self.request.user)

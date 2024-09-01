import json
import uuid
from pathlib import Path

import requests
from django.conf import settings
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from google.cloud import storage
from requests.auth import HTTPBasicAuth

from gis.models import Property, Feature
from gis.tasks import ingest_file_to_db_task


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

    def create_datastore(self) -> None:
        datastore_data = f"""
        <dataStore>
        <name>{self.store_name}</name>
        <connectionParameters>
            <host>postgres</host>
            <port>5432</port>
            <database>spatiallab</database>
            <user>postgres</user>
            <passwd>postgres</passwd>
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


@csrf_exempt
def upload_file(request):
    # TODO: Refactor this function into smaller functions
    if request.method == "POST" and request.FILES["file"]:
        client = storage.Client(credentials=settings.GCS_CREDENTIALS)
        bucket = client.bucket(settings.GCS_BUCKET_NAME)
        file = request.FILES["file"]
        file_path = Path(file.name)
        file_extension = file_path.suffix
        file_stem = file_path.stem
        file_name = f"{file_stem}_{uuid.uuid4()}{file_extension}"
        blob = bucket.blob(file_name)
        blob.upload_from_file(file)
        gcs_path = f"gs://{bucket.name}/{file_name}"
        layer_id = ingest_file_to_db_task(gcs_path, file_stem, request.user.email)
        geoserver_ingestor = GeoServerIngestor(layer_id)
        geoserver_ingestor.create_feature_view()
        geoserver_ingestor.create_datastore()
        geoserver_ingestor.create_feature_layer()
        return JsonResponse({"message": "File uploaded successfully"})
    return JsonResponse({"error": "Invalid request"}, status=400)


@csrf_exempt
def layer_view(request, layer_id):
    unique_keys = (
        Property.objects.filter(feature__layer__id=layer_id)
        .values_list("key", flat=True)
        .distinct()
    )
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
        for feature in Feature.objects.filter(layer__id=layer_id).prefetch_related(
            "properties"
        )
    ]
    return JsonResponse({"headers": list(unique_keys), "data": table_data})

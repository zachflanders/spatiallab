from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from google.cloud import storage
from django.conf import settings
from gis.tasks import ingest_file_to_db
import json
import uuid

from gis.models import Property, Feature

import requests
from requests.auth import HTTPBasicAuth


def create_feature_view(layer_id: int):
    view_name = f"layer_{layer_id}_features"
    with connection.cursor() as cursor:
        cursor.execute(
            f"""
            CREATE OR REPLACE VIEW {view_name} AS
            SELECT f.id, f.geometry, l.name AS layer_name
            FROM gis_feature f
            JOIN gis_layer l ON f.layer_id = l.id
            WHERE f.layer_id = %s
        """,
            [layer_id],
        )


@csrf_exempt
def upload_file(request):
    # TODO: Refactor this function into smaller functions
    if request.method == "POST" and request.FILES["file"]:
        file = request.FILES["file"]
        client = storage.Client(credentials=settings.GCS_CREDENTIALS)
        bucket = client.bucket(settings.GCS_BUCKET_NAME)
        file_name = f"{file.name}_{uuid.uuid4()}"
        blob = bucket.blob(file_name)
        blob.upload_from_file(file)
        gcs_path = f"gs://{bucket.name}/{file_name}"
        layer_id = ingest_file_to_db(gcs_path, file_name, request.user.email)
        create_feature_view(layer_id)
        geoserver_url = "http://geoserver:8080/geoserver"
        # TODO: Don't hardcode the username and password
        username = "admin"
        password = "password"
        workspace_name = "spatiallab"
        store_name = f"layer_{layer_id}_store"
        datastore_url = f"{geoserver_url}/rest/workspaces/{workspace_name}/datastores"

        datastore_data = f"""
        <dataStore>
        <name>{store_name}</name>
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

        response = requests.post(
            datastore_url,
            data=datastore_data,
            headers={"Content-Type": "text/xml"},
            auth=HTTPBasicAuth(username, password),
        )
        if response.status_code == 201:
            print(f"PostGIS data store '{store_name}' created successfully.")
        else:
            print(f"Failed to create PostGIS data store: {response.content}")

        layer_name = f"layer_{layer_id}_features"
        layer_url = f"{geoserver_url}/rest/workspaces/{workspace_name}/datastores/{store_name}/featuretypes"

        # TODO: Dynamically set the SRS based on the data
        layer_data = f"""
        <featureType>
        <name>{layer_name}</name>
        <nativeName>{layer_name}</nativeName>
        <srs>EPSG:4326</srs>  
        </featureType>
        """

        response = requests.post(
            layer_url,
            data=layer_data,
            headers={"Content-Type": "text/xml"},
            auth=HTTPBasicAuth(username, password),
        )
        if response.status_code == 201:
            print(f"Layer '{layer_name}' published successfully.")
        else:
            print(f"Failed to publish layer: {response.content}")

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

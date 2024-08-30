import json
import tempfile
from celery import shared_task
from google.cloud import storage
from django.contrib.gis.geos import GEOSGeometry
from gis.models import Layer, Feature, Property
from accounts.models import User


def parse_gcs_path(gcs_path):
    """Parses a GCS path into bucket name and blob name."""
    if not gcs_path.startswith("gs://"):
        raise ValueError("GCS path must start with 'gs://'")
    parts = gcs_path[5:].split("/", 1)
    if len(parts) != 2:
        raise ValueError("GCS path must be in the format 'gs://bucket_name/blob_name'")
    return parts[0], parts[1]


def download_from_gcs(gcs_path, local_file_path):
    """Downloads a file from GCS to a local file path."""
    storage_client = storage.Client()
    print(gcs_path)
    bucket_name, blob_name = parse_gcs_path(gcs_path)
    print(bucket_name)
    print(blob_name)
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)

    blob.download_to_filename(local_file_path)


@shared_task
def ingest_file_to_db(gcs_path, layer_name, user_email):
    """Ingests a file into the specified database table."""
    with tempfile.NamedTemporaryFile(delete=True) as temp_file:
        download_from_gcs(gcs_path, temp_file.name)
        temp_file.seek(0)  # Ensure the file pointer is at the beginning

        # Read the GeoJSON file
        geojson_data = json.load(temp_file)

    user = User.objects.get(email=user_email)
    # Create or get the Layer instance
    layer, created = Layer.objects.get_or_create(name=layer_name, user=user)

    # Iterate through the features in the GeoJSON
    for feature in geojson_data["features"]:
        # Create the Feature instance
        geometry = GEOSGeometry(json.dumps(feature["geometry"]))
        feature_instance = Feature.objects.create(
            name=feature["properties"].get("name", "Unnamed Feature"),
            geometry=geometry,
            layer=layer,
        )

        # Create Property instances for each feature
        for key, value in feature["properties"].items():
            Property.objects.create(key=key, value=value, feature=feature_instance)

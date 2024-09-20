import json
import logging
import tempfile
import zipfile
from pathlib import Path

import fiona
from celery import shared_task
from google.cloud import storage
from django.conf import settings
from django.contrib.gis.geos import GEOSGeometry
from django.core.cache import cache
from django.db import connection, close_old_connections, IntegrityError

from pyproj import CRS, Transformer

from gis.models import Layer, LayerFeature, LayerProperty, FeaturePropertyValue
from accounts.models import User

logger = logging.getLogger(__name__)


class FileIngestor:

    def __init__(self, gcs_path, layer_name, directory, user_email, task_id):
        self.gcs_path = gcs_path
        self.layer_name = layer_name
        self.directory = directory
        self.user_email = user_email
        self.task_id = task_id
        self.bucket_name, self.blob_name = self.parse_gcs_path()

    def parse_gcs_path(self):
        """Parses a GCS path into bucket name and blob name."""
        if not self.gcs_path.startswith("gs://"):
            raise ValueError("GCS path must start with 'gs://'")
        parts = self.gcs_path[5:].split("/", 1)
        if len(parts) != 2:
            raise ValueError(
                "GCS path must be in the format 'gs://bucket_name/blob_name'"
            )
        return parts[0], parts[1]

    def download_from_gcs(self, local_file_path):
        """Downloads a file from GCS to a local file path."""
        storage_client = storage.Client()
        bucket = storage_client.bucket(self.bucket_name)
        blob = bucket.blob(self.blob_name)
        blob.download_to_filename(local_file_path)

    def ingest_file_to_db(self):
        """Ingests a file into the specified database table."""
        with tempfile.NamedTemporaryFile(delete=True) as temp_file:
            self.download_from_gcs(temp_file.name)
            temp_file.seek(0)  # Ensure the file pointer is at the beginning
            file_extension = Path(self.gcs_path).suffix.lower()

            if file_extension == ".geojson":
                # Read the GeoJSON file
                geojson_data = json.load(temp_file)
                crs = (
                    geojson_data.get("crs", {})
                    .get("properties", {})
                    .get("name", "EPSG:4326")
                )
                if crs != "EPSG:4326":
                    transformer = Transformer.from_crs(
                        CRS(crs), CRS("EPSG:4326"), always_xy=True
                    )
                    features = [
                        {
                            **feature,
                            "geometry": self.transform_geom(
                                transformer, feature["geometry"]
                            ),
                        }
                        for feature in geojson_data["features"]
                    ]
                else:
                    features = geojson_data["features"]
            elif file_extension == ".zip":
                # Handle shapefile in a .zip file
                with tempfile.TemporaryDirectory() as temp_dir:
                    with zipfile.ZipFile(temp_file, "r") as zip_ref:
                        zip_ref.extractall(temp_dir)
                        shapefile_path = next(
                            (
                                Path(temp_dir) / name
                                for name in zip_ref.namelist()
                                if name.endswith(".shp")
                            ),
                            None,
                        )
                        if shapefile_path is None:
                            raise ValueError("No shapefile found in the .zip archive")

                        with fiona.open(shapefile_path) as shapefile:
                            crs = CRS(shapefile.crs)
                            transformer = Transformer.from_crs(
                                crs, CRS("EPSG:4326"), always_xy=True
                            )
                            features = []
                            for feature in shapefile:
                                geom = feature["geometry"]
                                if crs != CRS("EPSG:4326"):
                                    geom = self.transform_geom(transformer, geom)
                                features.append(
                                    {
                                        "type": "Feature",
                                        "geometry": geom,
                                        "properties": feature["properties"],
                                    }
                                )

        user = User.objects.get(email=self.user_email)
        # Create or get the Layer instance

        def increment_name(name, prev=0):
            try:
                if prev == 0:
                    return Layer.objects.create(
                        name=self.layer_name, user=user, directory_id=self.directory
                    )
                inc_name = Path(name).stem + f"({prev})" + Path(name).suffix
                return Layer.objects.create(
                    name=inc_name,
                    user=user,
                    directory_id=self.directory,
                )
            except IntegrityError:
                return increment_name(name, prev + 1)

        layer = increment_name(self.layer_name)
        logger.info(self.layer_name)
        logger.info(f"Layer created: {layer.id}: {layer.name}")

        total_features = len(features)
        processed_features = 0
        batch_size = 100

        # Dictionary for properties to avoid querying on each iteration
        property_dict = {
            prop.name: prop for prop in LayerProperty.objects.filter(layer=layer)
        }

        # Batch process for LayerFeature creation
        for i in range(0, total_features, batch_size):
            feature_batch = features[i : i + batch_size]

            # Create LayerFeature instances in batches
            feature_instance_batch = [
                LayerFeature(
                    geometry=GEOSGeometry(json.dumps(feature["geometry"])),
                    layer=layer,
                )
                for feature in feature_batch
            ]
            LayerFeature.objects.bulk_create(feature_instance_batch)

            # Create LayerProperty instances in batches
            unique_properties = set(
                key for feature in feature_batch for key in feature["properties"].keys()
            )

            # Add missing properties to property_dict if any new ones found in this batch
            new_properties = [
                LayerProperty(name=key, type="string", layer=layer)
                for key in unique_properties
                if key not in property_dict
            ]
            LayerProperty.objects.bulk_create(new_properties)

            # Update property_dict with any new properties created
            property_dict.update({prop.name: prop for prop in new_properties})

            # Create FeaturePropertyValue instances in batches
            values = []
            for feature, feature_instance in zip(feature_batch, feature_instance_batch):
                for key, value in feature["properties"].items():
                    layer_property = property_dict.get(key)
                    if layer_property:
                        values.append(
                            FeaturePropertyValue(
                                property=layer_property,
                                feature=feature_instance,
                                value=value,
                            )
                        )

            # Bulk create FeaturePropertyValue instances
            FeaturePropertyValue.objects.bulk_create(values)

            # Update the number of processed features and calculate progress
            processed_features += len(feature_batch)
            progress = int((processed_features / total_features) * 100)

            # Update cache with progress
            cache.set(self.task_id, {"status": "processing", "progress": progress})

        # If there are any remaining values after the loop (unlikely, but for safety):
        if values:
            FeaturePropertyValue.objects.bulk_create(values)
            processed_features += len(feature_batch)
            progress = int((processed_features / total_features) * 100)

            # Final cache update
            cache.set(self.task_id, {"status": "processing", "progress": progress})

        return layer.id

    @staticmethod
    def transform_geom(transformer, geom):
        """Transforms the geometry to EPSG:4326."""

        def transform_coords(coords):
            if isinstance(coords[0], (list, tuple)):
                return [transform_coords(c) for c in coords]
            else:
                return transformer.transform(coords[0], coords[1])

        geom_type = geom["type"]
        if geom_type == "Point":
            x, y = transformer.transform(geom["coordinates"][0], geom["coordinates"][1])
            return {"type": "Point", "coordinates": [x, y]}
        elif geom_type == "LineString":
            coords = [transformer.transform(x, y) for x, y in geom["coordinates"]]
            return {"type": "LineString", "coordinates": coords}
        elif geom_type == "Polygon":
            coords = [transform_coords(ring) for ring in geom["coordinates"]]
            return {"type": "Polygon", "coordinates": coords}
        elif geom_type == "MultiPoint":
            coords = [transformer.transform(x, y) for x, y in geom["coordinates"]]
            return {"type": "MultiPoint", "coordinates": coords}
        elif geom_type == "MultiLineString":
            coords = [transform_coords(line) for line in geom["coordinates"]]
            return {"type": "MultiLineString", "coordinates": coords}
        elif geom_type == "MultiPolygon":
            coords = [transform_coords(polygon) for polygon in geom["coordinates"]]
            return {"type": "MultiPolygon", "coordinates": coords}
        else:
            raise ValueError(f"Unsupported geometry type: {geom_type}")


def create_feature_view(layer_id) -> None:
    view_name = f"layer_{layer_id}_features"
    with connection.cursor() as cursor:
        cursor.execute(
            f"""
            CREATE OR REPLACE VIEW {view_name} AS
            SELECT f.id, f.geometry, l.name AS layer_name
            FROM gis_layerfeature f
            JOIN gis_layer l ON f.layer_id = l.id
            WHERE f.layer_id = %s
        """,
            [layer_id],
        )
    close_old_connections()


@shared_task(bind=True)
def ingest_file_to_db_task(self, file_name, layer_name, directory, user_email):
    """Task to ingest a file into the specified database table."""
    cache.set(self.request.id, {"status": "processing", "progress": 0})

    try:
        # Initialize the file ingestor
        ingestor = FileIngestor(
            f"gs://{settings.GCS_BUCKET_NAME}/{file_name}",
            layer_name,
            directory,
            user_email,
            task_id=self.request.id,
        )

        # Process the file and get the layer ID
        layer_id = ingestor.ingest_file_to_db()
        create_feature_view(layer_id)

        # Set the task progress to 100% and mark it as completed
        cache.set(
            self.request.id,
            {"status": "completed", "layer_id": layer_id, "progress": 100},
        )

    except Exception as e:
        # Handle errors by marking the task as failed
        cache.set(self.request.id, {"status": "error", "error": str(e)})
        raise e
    finally:
        close_old_connections()

    return layer_id

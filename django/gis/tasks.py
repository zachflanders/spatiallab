import json
import tempfile
import zipfile
from pathlib import Path

import fiona
from celery import shared_task
from google.cloud import storage
from django.contrib.gis.geos import GEOSGeometry
from pyproj import CRS, Transformer

from gis.models import Layer, Feature, Property
from accounts.models import User


class FileIngestor:

    def __init__(self, gcs_path, layer_name, user_email):
        self.gcs_path = gcs_path
        self.layer_name = layer_name
        self.user_email = user_email
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
                        self.transform_geom(transformer, feature["geometry"])
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
        layer, created = Layer.objects.get_or_create(name=self.layer_name, user=user)
        # Create Feature instances
        feature_instances = [
            Feature(
                name=feature["properties"].get("name", "Unnamed Feature"),
                geometry=GEOSGeometry(json.dumps(feature["geometry"])),
                layer=layer,
            )
            for feature in features
        ]
        # Bulk create Feature instances
        Feature.objects.bulk_create(feature_instances)
        # Create Property instances
        properties = [
            Property(key=key, value=value, feature=feature_instance)
            for feature_instance, feature in zip(feature_instances, features)
            for key, value in feature["properties"].items()
        ]
        # Bulk create Property instances
        Property.objects.bulk_create(properties)
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


def ingest_file_to_db_task(gcs_path, layer_name, user_email):
    """Task to ingest a file into the specified database table."""
    ingestor = FileIngestor(gcs_path, layer_name, user_email)
    return ingestor.ingest_file_to_db()

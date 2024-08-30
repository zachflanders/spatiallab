from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from google.cloud import storage
from django.conf import settings
from gis.tasks import ingest_file_to_db
import json
import uuid


@csrf_exempt
def upload_file(request):
    if request.method == "POST" and request.FILES["file"]:
        file = request.FILES["file"]
        client = storage.Client(credentials=settings.GCS_CREDENTIALS)
        bucket = client.bucket(settings.GCS_BUCKET_NAME)
        file_name = f"{file.name}_{uuid.uuid4()}"
        blob = bucket.blob(file_name)
        blob.upload_from_file(file)
        gcs_path = f"gs://{bucket.name}/{file_name}"
        ingest_file_to_db(gcs_path, file.name, request.user.email)

        return JsonResponse({"message": "File uploaded successfully"})
    return JsonResponse({"error": "Invalid request"}, status=400)

FROM kartoza/geoserver:latest

ARG GOOGLE_CREDENTIALS
ARG GCS_BUCKET_NAME
ARG GEOSERVER_ADMIN_USER
ARG GEOSERVER_ADMIN_PASSWORD

# Set environment variables for GeoServer and GCS
ENV GEOSERVER_ADMIN_USER=$GEOSERVER_ADMIN_USER
ENV GEOSERVER_ADMIN_PASSWORD=$GEOSERVER_ADMIN_PASSWORD
ENV GCS_BUCKET_NAME=$GCS_BUCKET_NAME

# Create directories
RUN mkdir -p /app /var/geoserver/data_dir

# Decode and store Google Cloud credentials
RUN echo "$GOOGLE_CREDENTIALS" | base64 --decode > /app/credentials.json

ENV GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json


# Install gcsfuse to mount GCS bucket
RUN apt-get update && apt-get install -y curl gnupg lsb-release && \
    echo "deb http://packages.cloud.google.com/apt gcsfuse-$(lsb_release -c -s) main" | tee /etc/apt/sources.list.d/gcsfuse.list && \
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add - && \
    apt-get update && apt-get install -y gcsfuse

# Mount the GCS bucket to GeoServer data directory and start GeoServer
ENTRYPOINT ["/bin/bash", "-c", "gcsfuse $GCS_BUCKET_NAME /var/geoserver/data_dir && export PORT=8080 && /scripts/entrypoint.sh"]

# Expose the port GeoServer will run on
EXPOSE 8080
FROM python:3.11-slim

# Set environment variables to ensure Python outputs UTF-8 
# and that poetry does not create a virtualenv
ENV LANG C.UTF-8
ENV POETRY_VIRTUALENVS_CREATE=false

ARG EMAIL_HOST
ARG EMAIL_HOST_USER
ARG EMAIL_HOST_PASSWORD
ARG GOOGLE_CREDENTIALS
ARG GCS_BUCKET_NAME

ENV EMAIL_HOST=$EMAIL_HOST
ENV EMAIL_HOST_USER=$EMAIL_HOST_USER
ENV EMAIL_HOST_PASSWORD=$EMAIL_HOST_PASSWORD
ENV GOOGLE_CREDENTIALS=$GOOGLE_CREDENTIALS
ENV GCS_BUCKET_NAME=$GCS_BUCKET_NAME

# Set working directory
WORKDIR /app

# Decode the Base64 credentials and set it as an environment variable
RUN if [ -n "$GOOGLE_CREDENTIALS" ]; then echo $GOOGLE_CREDENTIALS | base64 --decode > /app/credentials.json; fi

# Now the credentials are stored at /app/credentials.json and can be used by the app
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    gdal-bin \
    libgdal-dev \
    && rm -rf /var/lib/apt/lists/*

# Set GDAL environment variables
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal
ENV GDAL_LIBRARY_PATH=/usr/lib/libgdal.so

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

# Add Poetry to PATH
ENV PATH="/root/.local/bin:$PATH"

# Copy the pyproject.toml and poetry.lock files into the container
COPY pyproject.toml poetry.lock ./

# Install Python dependencies using Poetry
RUN poetry install --no-root

# Copy the rest of the application code into the container
COPY . .

# Collect static files
RUN poetry run python manage.py collectstatic --noinput

# Expose the port that the application will run on
EXPOSE 8080

# Command to run the application
CMD ["poetry", "run", "gunicorn", "spatiallab.wsgi:application", "--bind", "0.0.0.0:8080"]

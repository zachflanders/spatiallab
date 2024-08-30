FROM python:3.11-slim

# Set environment variables to ensure Python outputs UTF-8 
# and that poetry does not create a virtualenv
ENV LANG C.UTF-8
ENV POETRY_VIRTUALENVS_CREATE=false

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

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
EXPOSE 8000

# Command to run the application
CMD ["poetry", "run", "gunicorn", "spatiallab.wsgi:application", "--bind", "0.0.0.0:8000"]

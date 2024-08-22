# Spatial Lab - Web-Based GIS Platform

### 🚧🚀 **Under Construction** 🚀🚧

This project is currently under development. Stay tuned for updates! 👷‍♂️👷‍♀️
---

Spatial Lab is a web-based Geographic Information System (GIS) platform designed to offer powerful mapping and spatial data analysis capabilities. This project leverages Django, React, PostgreSQL with PostGIS, RabbitMQ, Celery, GeoServer, Jenkins, and NGINX to provide a comprehensive GIS solution.

## Table of Contents

- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
- [Services](#services)
- [Usage](#usage)
- [Volumes](#volumes)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Project Structure
```
├── django/ # Django backend code
│ ├── Dockerfile # Dockerfile for the Django service
│ ├── spatiallab/ # Main Django application
│ ├── pyproject.toml # Poetry configuration file
│ └── poetry.lock # Poetry lock file
├── react/ # React frontend code
├── nginx/ # NGINX configuration files
│ └── nginx.conf # NGINX configuration for reverse proxy
├── docker-compose.yml # Docker Compose file
└── README.md # Project documentation
```


## Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Setup

1. **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/spatial-lab.git
    cd spatial-lab
    ```

2. **Build and start the containers**:

    ```bash
    docker-compose up -d --build
    ```

    This will build all the necessary Docker images and start the services in the background.

3. **Access the application**:

    - Django Admin: [http://localhost/api/admin/](http://localhost/api/admin/)
    - React Frontend: [http://localhost/](http://localhost/)
    - GeoServer: [http://localhost/geoserver/](http://localhost/geoserver/)


## Services

- **Django**: The backend server running the main GIS application with a PostgreSQL database and Celery for asynchronous tasks.
- **PostgreSQL + PostGIS**: Database service with spatial extension support.
- **React**: Frontend service running a React application.
- **RabbitMQ**: Message broker service used by Celery.
- **Celery**: Task queue service for handling background tasks.
- **GeoServer**: A server for sharing geospatial data.
- **Jenkins**: Automation server for continuous integration and deployment.
- **NGINX**: Web server used as a reverse proxy for Django and React services.

## Usage

To interact with the services, you can use the following commands:

- **Start all services**:

    ```bash
    docker-compose up -d
    ```

- **Stop all services**:

    ```bash
    docker-compose down
    ```

- **View logs for a specific service**:

    ```bash
    docker-compose logs <service_name>
    ```

- **Rebuild a specific service**:

    ```bash
    docker-compose build <service_name>
    ```

## Volumes

The following Docker volumes are used to persist data:

- `postgres_data`: Stores the PostgreSQL database data.
- `rabbitmq_data`: Stores RabbitMQ data.
- `geoserver_data`: Stores GeoServer configuration and data.
- `jenkins_home`: Stores Jenkins configuration and build data.

## Troubleshooting

- **Django container fails to start**: Ensure that `gunicorn` is installed and accessible within the Django container. Check the `Dockerfile` and `docker-compose.yml` for correct setup.
  
- **Database connection issues**: Verify that the `DATABASE_URL` in the environment variables is correctly pointing to the PostgreSQL service.

- **GeoServer issues**: Check that the GeoServer container is running and that the data directory is correctly mounted.

- **NGINX configuration issues**: Ensure that the NGINX configuration file (`nginx.conf`) correctly points to the Django and React services.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
# FlexPrice Frontend Docker Setup

This guide will help you set up and run the FlexPrice frontend application using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your system
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

## Quick Start

The easiest way to get started is by using our setup script:

```bash
./setup.sh
```

This script will:

1. Check if Docker and Docker Compose are installed
2. Create a `.env` file if one doesn't exist
3. Prompt you to choose between development and production environments
4. Start the application in the selected environment

## Manual Setup

If you prefer to set things up manually, follow these steps:

### 1. Configure Environment Variables

Copy the example environment file and update it with your Supabase credentials:

```bash
cp .env.example .env
```

Edit the `.env` file and add your Supabase URL and anonymous key.

### 2. Development Environment

To start the development environment with hot-reloading:

```bash
docker-compose up dev
```

This will start the application on http://localhost:3000

### 3. Production Environment

To start the production environment:

```bash
docker-compose up -d prod
```

This will start the application on http://localhost

## Docker Compose Services

The application includes two services:

- **dev**: Development environment with hot-reloading
- **prod**: Production-optimized build served with Nginx

## Customization

You can modify the Docker configuration by editing the following files:

- `Dockerfile`: Main production Dockerfile
- `docker/Dockerfile.dev`: Development Dockerfile
- `docker/nginx.conf`: Nginx configuration for production
- `docker-compose.yml`: Services configuration

## Troubleshooting

### Common Issues

1. **Port conflicts**: If ports 3000 or 80 are already in use, modify the port mappings in `docker-compose.yml`.

2. **Permissions issues**: If you encounter permissions problems with Docker, make sure your user has permission to run Docker commands or use `sudo`.

3. **Hot reloading not working**: Ensure your Docker volumes are properly mounted in the `docker-compose.yml` file.

## Additional Commands

- **Stop containers**: `docker-compose down`
- **View logs**: `docker-compose logs -f [service]`
- **Rebuild containers**: `docker-compose build [service]`
- **Remove volumes**: `docker-compose down -v`

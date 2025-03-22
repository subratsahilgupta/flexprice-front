#!/bin/bash

# Function to create .env file
create_env_file() {
    cat > .env << EOL
VITE_API_URL=http://localhost:8088/v1
VITE_ENVIRONMENT=self-hosted
EOL
    echo "Created .env file with required configuration"
}

# Function to build and run Docker
docker_build_and_run() {
    echo "Building Docker image..."
    docker build -t flexprice-front .

    echo "Running Docker container..."
    docker run -d -p 3000:3000 flexprice-front
}

# Main execution
echo "Starting FlexPrice Frontend Setup..."

# Create .env file
create_env_file

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Build and run Docker
docker_build_and_run

echo "Setup completed! The application should be running at http://localhost:3000" 
#!/bin/bash

# Color variables
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
  echo -e "${1}${2}${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  print_message "$RED" "Docker is not installed. Please install Docker first."
  exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
  print_message "$RED" "Docker Compose is not installed. Please install Docker Compose first."
  exit 1
fi

print_message "$BLUE" "🚀 Setting up FlexPrice Frontend application..."

# Check if .env file exists, if not copy from example
if [ ! -f ".env" ]; then
  print_message "$YELLOW" "Creating .env file from .env.example..."
  cp .env.example .env
  print_message "$GREEN" "✅ Created .env file"
  print_message "$YELLOW" "⚠️ Please edit the .env file with your Supabase credentials"
  read -p "Press enter to continue after editing your .env file..."
fi

# Ask which environment to start
print_message "$BLUE" "Which environment would you like to start?"
echo "1) Development (with hot reloading)"
echo "2) Production"
read -p "Enter your choice (1/2): " choice

case $choice in
  1)
    print_message "$BLUE" "Starting development environment..."
    docker-compose up dev
    ;;
  2)
    print_message "$BLUE" "Starting production environment..."
    docker-compose up -d prod
    print_message "$GREEN" "✅ Production environment started at http://localhost"
    ;;
  *)
    print_message "$RED" "Invalid choice. Exiting."
    exit 1
    ;;
esac 
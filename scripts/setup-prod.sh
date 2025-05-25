#!/bin/bash
set -e

# Create necessary directories
mkdir -p uploads logs/caddy static

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example"
    cp .env.example .env

    # Generate a secure random key for production
    SECRET_KEY=$(openssl rand -hex 32)
    sed -i "s/your-secret-key-for-development/$SECRET_KEY/" .env

    # Prompt for domain name
    read -p "Enter your domain name (default: localhost): " DOMAIN
    DOMAIN=${DOMAIN:-localhost}
    echo "DOMAIN=$DOMAIN" >> .env

    # Prompt for database password
    read -p "Enter database password (default: postgres): " DB_PASSWORD
    DB_PASSWORD=${DB_PASSWORD:-postgres}
    echo "DB_PASSWORD=$DB_PASSWORD" >> .env

    # Set environment to production
    echo "ENVIRONMENT=production" >> .env

    # Set CORS origins
    read -p "Enter allowed CORS origins (comma-separated, default: *): " CORS_ORIGINS
    CORS_ORIGINS=${CORS_ORIGINS:-*}
    echo "CORS_ORIGINS=$CORS_ORIGINS" >> .env
fi

# Start the containers in production mode
echo "Starting containers in production mode..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for the database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec api alembic revision --autogenerate -m "initial"
docker-compose -f docker-compose.prod.yml exec api alembic upgrade head

echo "Production environment is ready!"
echo "API is running at: https://${DOMAIN:-localhost}"
echo "API documentation is available at: https://${DOMAIN:-localhost}/docs"

# Dockerfile for Django backend
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        gcc \
    && rm -rf /var/lib/apt/lists/*

# Create work directory
WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/ .

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port (Render sets $PORT env var)
EXPOSE $PORT

# Start Gunicorn
CMD gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT

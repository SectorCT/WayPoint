# Security Setup Guide

## Environment Variables

This project uses environment variables to store sensitive configuration data. Follow these steps to set up your environment:

### 1. Copy the example environment file
```bash
cp env_example.txt .env
```

### 2. Update the .env file with your actual values

**IMPORTANT**: Replace the placeholder values with your actual secrets:

- `SECRET_KEY`: Generate a secure Django secret key. You can use Django's built-in generator:
  ```python
  from django.core.management.utils import get_random_secret_key
  print(get_random_secret_key())
  ```

- `DB_PASSWORD`: Use a strong database password
- `EMAIL_HOST_PASSWORD`: Use your email service password or app-specific password

### 3. Security Best Practices

- Never commit the `.env` file to version control
- Use different secrets for development, staging, and production
- Regularly rotate your secrets
- Use strong, unique passwords for all services

### 4. Docker Setup

When using Docker Compose, you can either:
- Set environment variables in your shell before running `docker-compose up`
- Create a `.env` file in the server directory (this file is gitignored)

Example:
```bash
export SECRET_KEY="your-actual-secret-key-here"
docker-compose up
```

## Google Maps API Keys

For the mobile app, you'll need to:

1. Get Google Maps API keys from the Google Cloud Console
2. Replace the placeholder values in `Client/app.json` with your actual API keys
3. Ensure your API keys have the appropriate restrictions set up

**Note**: The current placeholder values in `Client/app.json` are safe to commit as they are clearly marked as placeholders.

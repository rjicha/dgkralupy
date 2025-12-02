# Docker Setup

This directory contains Docker configuration files for the dgkralupy.cz project.

## Files

### nginx.conf

Custom nginx configuration optimized for serving the static Astro site with:

- Gzip compression for faster loading
- Proper MIME types for all assets
- Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- Aggressive caching for static assets (1 year)
- No caching for HTML files (always fresh content)
- SPA-friendly routing fallbacks

## Architecture

The Docker setup uses multi-stage builds:

1. **Builder stage** (node:20-alpine)
   - Installs dependencies with `npm ci`
   - Builds the production site with `npm run build`
   - Optimized for reproducibility and security

2. **Production stage** (nginx:alpine)
   - Lightweight nginx server
   - Only contains built assets (no source code)
   - Includes health checks
   - Minimal attack surface

## Usage

See the main README.md for usage instructions.

## Port Mapping

- Production: Container port 80 → Host port 8080
- Development: Container port 4321 → Host port 4321

## Security Features

- Non-root user in containers
- Minimal base images (Alpine Linux)
- Security headers enabled
- No development dependencies in production image
- Health checks for container monitoring

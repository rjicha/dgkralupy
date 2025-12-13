#!/bin/bash
# Script to configure the Cloudflare Worker URL in CMS config

set -e

echo "============================================"
echo "Cloudflare Worker OAuth Configuration"
echo "============================================"
echo ""

# Check if worker URL is provided
if [ -z "$1" ]; then
    echo "Usage: ./scripts/configure-oauth-worker.sh <WORKER_URL>"
    echo ""
    echo "Example:"
    echo "  ./scripts/configure-oauth-worker.sh https://sveltia-cms-auth.my-subdomain.workers.dev"
    echo ""
    echo "Get your Worker URL from:"
    echo "  1. Cloudflare Dashboard → Workers & Pages"
    echo "  2. Or from the wrangler deploy output"
    exit 1
fi

WORKER_URL=$1

# Remove trailing slash if present
WORKER_URL=${WORKER_URL%/}

# Validate URL format
if [[ ! $WORKER_URL =~ ^https?:// ]]; then
    echo "Error: Worker URL must start with http:// or https://"
    echo "Provided: $WORKER_URL"
    exit 1
fi

echo "Worker URL: $WORKER_URL"
echo ""

# Update config.yml
CONFIG_FILE="public/admin/config.yml"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: $CONFIG_FILE not found!"
    exit 1
fi

# Replace the placeholder
if grep -q "YOUR_WORKER_URL" "$CONFIG_FILE"; then
    sed -i "s|base_url: YOUR_WORKER_URL|base_url: $WORKER_URL|g" "$CONFIG_FILE"
    echo "✓ Updated $CONFIG_FILE"
else
    echo "Warning: Placeholder 'YOUR_WORKER_URL' not found in $CONFIG_FILE"
    echo "The file may have already been configured."
    echo ""
    echo "Current base_url:"
    grep "base_url:" "$CONFIG_FILE" || echo "  (not found)"
fi

echo ""
echo "============================================"
echo "Configuration complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Rebuild your site: npm run build"
echo "  2. Commit and push changes"
echo "  3. Test at: https://rjicha.github.io/dgkralupy/admin/"
echo ""
echo "GitHub OAuth Callback URL should be:"
echo "  $WORKER_URL/callback"
echo ""

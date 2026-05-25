#!/usr/bin/env bash
set -e

echo "=== VisKet Production Deploy ==="

# Pull latest code
git pull origin main

# Install PHP dependencies (no dev)
composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev

# Install Node dependencies and build
npm ci
npm run build

# Generate key if missing (usually already set via env)
# php artisan key:generate

# Run migrations
php artisan migrate --force

# Create storage symlink if missing
if [ ! -L "public/storage" ]; then
    rm -rf public/storage
    php artisan storage:link
fi

# Cache optimization
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Restart queue workers (supervisor should pick them up)
php artisan queue:restart

# Optional: restart Reverb if managed by supervisor/systemd
# sudo systemctl restart reverb

echo "=== Deploy finished ==="

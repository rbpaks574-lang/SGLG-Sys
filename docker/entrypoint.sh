#!/bin/sh
set -e

echo "=== Starting SGLG Portal Container ==="

# Initialize SQLite database file in case sqlite is used
mkdir -p /var/www/html/database
if [ ! -f /var/www/html/database/database.sqlite ]; then
    touch /var/www/html/database/database.sqlite
fi
chmod 777 /var/www/html/database /var/www/html/database/database.sqlite
chown -R www-data:www-data /var/www/html/database

# Ensure all storage & cache directories exist and have full write permissions
mkdir -p /var/www/html/storage/framework/cache/data
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/app/public
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/bootstrap/cache
touch /var/www/html/storage/logs/laravel.log

chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Create storage symlink
php artisan storage:link --force || true

# Test database connection and run migrations
echo "=== Running Database Migrations (Verbose) ==="
php artisan migrate --force --verbose || echo "Database migration failed: please check DB credentials in Render Environment tab."

echo "=== Running Database Seeders (Verbose) ==="
php artisan db:seed --force --verbose || echo "Database seeders failed: please check DB credentials in Render Environment tab."

# Cache configs and routes
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Start PHP-FPM in background
echo "=== Starting PHP-FPM ==="
php-fpm -F &

# Wait for PHP-FPM
sleep 1

# Start Nginx in foreground
echo "=== Starting Nginx ==="
exec nginx -g "daemon off;"

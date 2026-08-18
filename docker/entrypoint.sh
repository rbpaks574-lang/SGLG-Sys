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

# Run database migrations and seeders
echo "=== Running Database Migrations ==="
php artisan migrate --force || echo "Migration notice"

echo "=== Running Database Seeders ==="
php artisan db:seed --force || echo "Seeder notice"

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

#!/bin/sh
set -e

echo "=== Starting SGLG Portal Container ==="

# Initialize SQLite database file if DB_CONNECTION is sqlite
if [ "$DB_CONNECTION" = "sqlite" ] || [ -z "$DB_CONNECTION" ]; then
    mkdir -p /var/www/html/database
    touch /var/www/html/database/database.sqlite
    chown -R www-data:www-data /var/www/html/database
fi

# Ensure storage directories exist and are writable
mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/app/public
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Create storage symlink
php artisan storage:link --force || true

# Run database migrations and seeders
echo "=== Running Database Migrations ==="
php artisan migrate --force --seed || echo "Warning: Migration failed, please verify DB credentials."

# Cache configs and routes for production speed
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Start PHP-FPM in background with -F (foreground mode kept in background subshell)
echo "=== Starting PHP-FPM ==="
php-fpm -F &

# Wait for PHP-FPM to be ready
sleep 2

# Start Nginx in foreground
echo "=== Starting Nginx ==="
exec nginx -g "daemon off;"

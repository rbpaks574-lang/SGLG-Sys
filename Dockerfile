# ==========================================
# Stage 1: Build Backend & Frontend Assets
# ==========================================
FROM php:8.3-fpm-alpine AS builder

# Install system dependencies, PHP extensions, and Node.js
RUN apk add --no-cache \
    curl \
    git \
    nodejs \
    npm \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    icu-dev \
    sqlite-dev \
    oniguruma-dev \
    bash \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_mysql \
        pdo_sqlite \
        gd \
        zip \
        bcmath \
        intl \
        mbstring \
        opcache

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy all project files
COPY . .

# Install PHP dependencies first (so Artisan and Wayfinder work during Vite build)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Install NPM packages and build frontend assets
RUN npm ci && npm run build

# ==========================================
# Stage 2: Production Server (PHP-FPM + Nginx)
# ==========================================
FROM php:8.3-fpm-alpine

# Install production runtime dependencies & Nginx
RUN apk add --no-cache \
    nginx \
    curl \
    git \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    icu-dev \
    sqlite-dev \
    oniguruma-dev \
    bash \
    ca-certificates \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_mysql \
        pdo_sqlite \
        gd \
        zip \
        bcmath \
        intl \
        mbstring \
        opcache

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy everything from builder (including vendor and public/build)
COPY --from=builder /var/www/html /var/www/html

# Copy Nginx config & Entrypoint script
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Setup permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

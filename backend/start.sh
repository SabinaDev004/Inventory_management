#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "=== Inventory Management API Server ==="
echo "Starting Symfony API on http://localhost:8000"
echo "Press Ctrl+C to stop"
echo ""

# Run PHP with error logging and output buffering disabled
php -d error_log=/tmp/php-inventory-errors.log \
    -d display_errors=0 \
    -d output_buffering=0 \
    -d implicit_flush=1 \
    -S 0.0.0.0:8000 \
    -t public/ \
    router.php

# If php -S exits, restart automatically
if [ $? -ne 0 ]; then
    echo ""
    echo "Server stopped unexpectedly. Restarting..."
    echo "Check /tmp/php-inventory-errors.log for details."
    sleep 1
    exec "$0"
fi

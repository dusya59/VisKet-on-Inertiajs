<?php
/**
 * OPcache reset for shared hosting environments where php-fpm reload is not available.
 * Access this file via browser to clear opcache after deployments.
 * Consider protecting this with a secret key in production.
 */

if (function_exists('opcache_reset')) {
    opcache_reset();
    echo "OPcache reset successfully.";
} else {
    echo "OPcache is not enabled.";
}

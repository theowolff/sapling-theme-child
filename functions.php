<?php
    if(! defined('TWWP_CHILD_DIST')) {
        define('TWWP_CHILD_DIST', get_stylesheet_directory_uri() . '/dist');
    }

    // Wire extras - core files
    require_once __DIR__ . '/extras/helpers.php';
    require_once __DIR__ . '/extras/setup.php';
    require_once __DIR__ . '/extras/theme-functions.php';
    require_once __DIR__ . '/extras/ajax.php';

    // Wire extras - custom files
    require_once __DIR__ . '/extras/post-types/post-types.php';
    require_once __DIR__ . '/extras/shortcodes/shortcodes.php';
    require_once __DIR__ . '/extras/integrations/integrations.php';
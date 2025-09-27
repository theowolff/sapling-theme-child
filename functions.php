<?php
    /**
     * Child theme bootstrap: constants, theme props, and core includes.
     *
     * @package sapling-theme-child
     * @author theowolff
     */

    /**
     * Define constant for child theme assets directory.
     */
    if(! defined('SPLNG_CHILD_DIST')) {
        define('SPLNG_CHILD_DIST', get_stylesheet_directory_uri() . '/dist');
    }

    /**
     * Get the theme object and properties.
     */
    global $splng_theme, $splng_theme_slug, $splng_theme_prefix, $splng_theme_version;
    $splng_theme = wp_get_theme();
    $splng_theme_version = $splng_theme->get('Version');
    $splng_theme_slug = wp_get_theme()->get('TextDomain');
    $splng_theme_prefix = strtolower(preg_replace('/[^a-z0-9]+/', '-', $splng_theme_slug));

    /**
     * Wire extras: core files.
     */
    require_once __DIR__ . '/extras/helpers.php';
    require_once __DIR__ . '/extras/setup.php';
    require_once __DIR__ . '/extras/theme-functions.php';
    require_once __DIR__ . '/extras/ajax.php';

    /**
     * Wire extras: custom files.
     */
    require_once __DIR__ . '/extras/post-types/post-types.php';
    require_once __DIR__ . '/extras/shortcodes/shortcodes.php';
    require_once __DIR__ . '/extras/integrations/integrations.php';
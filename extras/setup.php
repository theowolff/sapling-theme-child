<?php
    /**
     * Theme setup & bootstrap: enqueue, supports, analytics placeholders.
     *
     * @package sapling-theme-child
     * @author theowolff
     */

    /**
     * Enqueue child theme styles and scripts.
     * @return void
     */
    function splng_child_enqueue_styles_scripts() {
        global $splng_theme_prefix, $splng_theme_version;

        /** Styles */
        wp_enqueue_style("$splng_theme_prefix-main", SPLNG_CHILD_DIST . '/css/main.min.css', array(), $splng_theme_version);
        
        /** Scripts */
        wp_enqueue_script('jquery');
        wp_enqueue_script("$splng_theme_prefix-main", SPLNG_CHILD_DIST . '/js/main.min.js', array('jquery'), $splng_theme_version, true);
    }
    add_action('wp_enqueue_scripts', 'splng_child_enqueue_styles_scripts', 20);

    /**
     * Define the theme's widget areas and sidebars.
     * @return void
     */
    function splng_register_widget_areas() {

        // register_sidebar(array(
        //     'name'          => __('', 'sapling'),
        //     'id'            => '',
        //     'description'   => __('', 'sapling'),
        //     'before_widget' => '<li id="%1$s" class="widget %2$s">',
        //     'after_widget'  => '</li>',
        //     'before_title'  => '<h4 class="widgettitle">',
        //     'after_title'   => '</h4>',
        // ));
    }
    add_action('widgets_init', 'splng_register_widget_areas', 10);

    /**
     * Register additional theme menu locations.
     * @return void
     */
    function splng_register_theme_menus() {

        // register_nav_menus(array(
        //     'primary' => __('Primary Menu', get_stylesheet()),
        // ));
    }
    add_action('after_setup_theme', 'splng_register_theme_menus', 5);

    /**
     * Save ACF GUI edits to the child theme.
     * @param string path
     */
    function splng_acf_json_save_point($path) {
        return get_stylesheet_directory() . '/acf-json';
    }
    add_filter('acf/settings/save_json', 'splng_acf_json_save_point');

    /**
     * ACF Load order: child first (overrides), then parent (defaults).
     * @param array paths
     */
    function sapling_acf_json_load_points($paths) {

        /**
         * Reset and define explicit order.
         */
        $paths = array();

        // Child
        $paths[] = get_stylesheet_directory() . '/acf-json'; 

        // Parent
        $paths[] = get_template_directory() . '/acf-json'; 

        return $paths;
    }
    add_filter('acf/settings/load_json', 'sapling_acf_json_load_points');

    /**
     * Add the Theme Setup options page (requires ACF Pro).
     * @return void
     */
    if(function_exists('acf_add_options_page')) {

        global $splng_theme_slug;
        $site_name = get_bloginfo('name');

        acf_add_options_page(array(
            'page_title'  => sprintf(__('%s Setup', $splng_theme_slug), $site_name),
            'menu_title'  => sprintf(__('%s Setup', $splng_theme_slug), $site_name),
            'menu_slug'   => $splng_theme_slug . '-setup',
            'capability'  => 'edit_posts',
            'redirect'    => false,
            'position'    => 2,
            'icon_url'    => 'dashicons-shortcode'
        ));
    }

    /**
     * Remove the editor from specific page-templates.
     * @return void
     */
    function splng_remove_editor_support_from_pages() {

        $editor_disabled_pages = array(

        );

        if(in_array(get_page_template_slug(), $editor_disabled_pages)) {
            remove_post_type_support('page', 'editor');
        }
    }
    add_action('admin_head', 'splng_remove_editor_support_from_pages');

    // Disable block editor from managing widgets in the Gutenberg plugin.
    add_filter('gutenberg_use_widgets_block_editor', '__return_false', 100);

    // Disable block editor from managing widgets. renamed from wp_use_widgets_block_editor
    add_filter('use_widgets_block_editor', '__return_false');

    /**
     * Fix wp_get_sidebars_widgets() returning false and breaking array_merge if no widgets are available.
     * @param mixed $widgets
     * @return array
     */
    function splng_fix_wp_sidebar_widgets_false($widgets) {
        return $widgets === false ? array() : $widgets;
    }
    add_filter('sidebars_widgets', 'splng_fix_wp_sidebar_widgets_false');

    /**
     * Add relevant tracking codes to the site's <head>.
     * @return void
     */
    function splng_add_tracking_codes() {
    ?>

    <?php
    }
    add_action('wp_head', 'splng_add_tracking_codes');

    /**
     * Add relevant tracking codes to the site's <body> (after opening tag).
     * @return void
     */
    function splng_add_body_tracking_codes() {
    ?>

    <?php
    }
    add_action('wp_body_open', 'splng_add_body_tracking_codes');

    /**
     * Set the theme footer's contents.
     * @return void
     */
    function splng_site_footer() {
        ob_start();
    ?>

    <?php
        $contents = ob_get_contents();
        ob_end_clean();

        // Echo contents and replace the year placeholder if it exists
        echo str_replace('{year}', date('Y'), $contents);
    }
    add_action('sapling/footer', 'splng_site_footer');

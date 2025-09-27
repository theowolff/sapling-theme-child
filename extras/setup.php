<?php
    /**
     * Theme setup & bootstrap: enqueue, supports, analytics placeholders.
     */

    // Get the theme object and props
    global $wp, $the_theme, $theme_slug;
    $the_theme = wp_get_theme();
    $theme_slug = wp_get_theme()->get('TextDomain');

    // Enqueue styles and scripts
    function splng_child_enqueue_styles_scripts() {

        // Generate the files slug
        global $theme_slug, $the_theme;
        $prefix = strtolower(preg_replace('/[^a-z0-9]+/', '-', $theme_slug));
        
        /** Styles */
        wp_enqueue_style("$prefix-vendor", SPLNG_CHILD_DIST . '/css/vendor.min.css', array(), $version);
        wp_enqueue_style("$prefix-main", SPLNG_CHILD_DIST . '/css/main.min.css', array(), $the_theme->get('Version'));

        /** Scripts **/
        wp_enqueue_script('jquery');
        wp_enqueue_script("$prefix-vendor", SPLNG_CHILD_DIST . '/js/vendor.min.js', array('jquery'), $version, true);
        wp_enqueue_script("$prefix-main", SPLNG_CHILD_DIST . '/js/main.min.js', array('jquery'), $the_theme->get('Version'), true);
    }
    add_action('wp_enqueue_scripts', 'splng_child_enqueue_styles_scripts', 20);

    // Define the theme's widget areas and sidebars
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

    // Register additional theme menu locations
    function splng_register_theme_menus() {

        // register_nav_menus(array(
        //     'primary' => __('Primary Menu', get_stylesheet()),
        // ));
    }
    add_action('after_setup_theme', 'splng_register_theme_menus', 5);

    // Add the Theme Setup options page (requires ACF Pro)
    if(function_exists('acf_add_options_page')) {

        // Get site name and theme slug for titles
        global $theme_slug;
        $site_name = get_bloginfo('name');

        acf_add_options_page(array(
            'page_title'  => sprintf(__('%s Setup', $theme_slug), $site_name),
            'menu_title'  => sprintf(__('%s Setup', $theme_slug), $site_name),
            'menu_slug'   => $theme_slug . '-setup',
            'capability'  => 'edit_posts',
            'redirect'    => false,
            'position'    => 2,
            'icon_url'    => 'dashicons-shortcode'
        ));
    }
    
    // Remove the editor from specific page-templates
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

    // Resolve the issue with wp_get_sidebars_widgets() returning 
    // false and breaking array_marge if no widgets are available  
    // and Guttenberg is disabled for the widgets customizer.
    function splng_fix_wp_sidebar_widgets_false($widgets) {
        return $widgets === false ? array() : $widgets;
    }
    add_filter('sidebars_widgets', 'splng_fix_wp_sidebar_widgets_false');

    // Add relevant tracking codes to the site's <head>
    function splng_add_tracking_codes() {
    ?>

    <?php
    }
    add_action('wp_head', 'splng_add_tracking_codes');

    // Add relevant tracking codes to the site's <body> (after opening tag)
    function splng_add_body_tracking_codes() {
    ?>

    <?php
    }
    add_action('wp_body_open', 'splng_add_body_tracking_codes'); 

    // Set the theme footer's contents
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

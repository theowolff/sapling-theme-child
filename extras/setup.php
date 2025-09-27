<?php
    /**
     * Theme setup & bootstrap: enqueue, supports, analytics placeholders.
     */

    // Enqueue styles and scripts
    function twwp_child_enqueue_styles_scripts() {
        global $wp;
        $the_theme = wp_get_theme();

        /** Parent scripts and styles */
        wp_enqueue_style('twwp-child-main');
        wp_enqueue_script('twwp-child-main');
        
        /** Child styles */
        wp_register_style('twwp-child-main', TWWP_CHILD_DIST . '/css/main.min.css', [], $the_theme->get('Version'));

        /** Child scripts **/
        wp_enqueue_script('jquery');
        wp_register_script('twwp-child-main', TWWP_CHILD_DIST . '/js/main.js', [], $the_theme->get('Version'), true);
    }
    add_action('wp_enqueue_scripts', 'twwp_child_enqueue_styles_scripts');

    // Define the theme's widget areas and sidebars
    function twwp_register_widget_areas() {

        // register_sidebar(array(
        //     'name'          => __('', 'wpstarter'),
        //     'id'            => '',
        //     'description'   => __('', 'wpstarter'),
        //     'before_widget' => '<li id="%1$s" class="widget %2$s">',
        //     'after_widget'  => '</li>',
        //     'before_title'  => '<h4 class="widgettitle">',
        //     'after_title'   => '</h4>',
        // ));
    }
    add_action('widgets_init', 'twwp_register_widget_areas', 10);

    // Register additional theme menu locations
    function twwp_register_theme_menus() {

        // register_nav_menus(array(
        //     'primary' => __('Primary Menu', get_stylesheet()),
        // ));
    }
    add_action('after_setup_theme', 'twwp_register_theme_menus', 5);

    // Add the Theme Setup options page (requires ACF Pro)
    if(function_exists('acf_add_options_page')) {

        // Get site name for titles
        $site_name = get_bloginfo('name');

        // Get child theme slug (folder name / text domain)
        $theme_slug = wp_get_theme()->get('TextDomain');

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
    function twwp_remove_editor_support_from_pages() {

        $editor_disabled_pages = array(
            
        );

        if(in_array(get_page_template_slug(), $editor_disabled_pages)) {
            remove_post_type_support('page', 'editor');
        }
    }
    add_action('admin_head', 'twwp_remove_editor_support_from_pages');

    // Disable block editor from managing widgets in the Gutenberg plugin.
    add_filter('gutenberg_use_widgets_block_editor', '__return_false', 100);

    // Disable block editor from managing widgets. renamed from wp_use_widgets_block_editor
    add_filter('use_widgets_block_editor', '__return_false');

    // Resolve the issue with wp_get_sidebars_widgets() returning 
    // false and breaking array_marge if no widgets are available  
    // and Guttenberg is disabled for the widgets customizer.
    function twwp_fix_wp_sidebar_widgets_false($widgets) {
        return $widgets === false ? array() : $widgets;
    }
    add_filter('sidebars_widgets', 'twwp_fix_wp_sidebar_widgets_false');

    // Add relevant tracking codes to the site's <head>
    function twwp_add_tracking_codes() {
    ?>

    <?php
    }
    add_action('wp_head', 'twwp_add_tracking_codes');

    // Add relevant tracking codes to the site's <body> (after opening tag)
    function twwp_add_body_tracking_codes() {
    ?>

    <?php
    }
    add_action('wp_body_open', 'twwp_add_body_tracking_codes'); 

    // Set the theme footer's contents
    function twwp_site_footer() {
        ob_start();
    ?>


    <?php
        $contents = ob_get_contents();
        ob_end_clean();

        // Echo contents and replace the year placeholder if it exists
        echo str_replace('{year}', date('Y'), $contents);
    }
    add_action('twwp/footer', 'twwp_site_footer');

<?php
    /**
     * Main page template for displaying flexible ACF content sections.
     *
     * @package sapling-theme-child
     * @author theowolff
     */

    /**
     * Load site header template.
     */
    get_header();
?>

<main class="site-main" id="main">
    <?php
        /**
         * Loop through posts and display flexible ACF content sections.
         */
        if(have_posts()) {
            while(have_posts()) {
                the_post();

                /**
                 * Access global theme prefix variable.
                 */
                global $splng_theme_prefix;

                /**
                 * Load ACF flexible content sections (if any).
                 */
                if(have_rows("{$splng_theme_prefix}__global_components")) {
                    while(have_rows("{$splng_theme_prefix}__global_components")) {
                        the_row();

                        /**
                         * Retrieve layout name and load corresponding partial template.
                         */
                        $layout = str_replace("{$splng_theme_prefix}__global_component--", '', get_row_layout());
                        get_template_part("partial-templates/sections/$layout");
                    }
                }
            }
        }
    ?>
</main>

<?php
    /**
     * Load site footer template.
     */
    get_footer();
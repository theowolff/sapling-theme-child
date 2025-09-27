<?php
    get_header();
?>

<main class="site-main" id="main">
    <div class="container">
        <?php
            /**
             * Use a flexible ACF field to build out page content sections.
             * Each section is a separate partial template.
             */
            if(have_posts()) {
                while(have_posts()) {
                    the_post();

                    // Get the theme's prefix to use with the field name
                    global $splng_theme_prefix;

                    // If any rows were found, loop through them.
                    if(have_rows("{$splng_theme_prefix}__global_components")) {
                        while(have_rows("{$splng_theme_prefix}__global_components")) {
                            the_row();

                            // Extract the layout name and load the corresponding partial template.
                            // Assumes partial templates are in partial-templates/sections/
                            // and named to match the layout name (minus the prefix).
                            $layout = str_replace("{$splng_theme_prefix}__global_component--", '', get_row_layout());
                            get_template_part("partial-templates/sections/$layout");
                        }
                    }
                }
            }
        ?>
    </div>
</main>

<?php
    get_footer();
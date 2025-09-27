![Sapling Logo](./sapling.svg)
# Sapling Child Theme

The child theme builds on the Sapling Starter Theme, providing a structure for overrides and project-specific customization.

---

## File Structure

- **`src/scss`**
  - `_globals.scss`, `_variables.scss`, `_partials.scss` → base overrides
  - `pages/` → page-specific styles (`about.scss` → `dist/css/pages/about.min.css`)
  - `sections/` → reusable block/section styles (bundled into `sections.min.css`)
  - `main.scss` → imports parent globals + variables, then applies child overrides
  - `_shared.scss` → central module that `@forward`s variables/mixins you want available across modules
- **`src/js`**
  - `main.js` → default scripts for the child theme
  - `admin.js` → WordPress admin-side scripts
- **`src/vendor`**
  - Safe folder for third-party assets you want shipped with the theme.
  - Use subfolders for clarity:
    - **`/css`** – Place any vendor stylesheets here (e.g., `slick.css`, `slick-theme.css`).  
      Files will be copied to `dist/vendor/css/` with the same structure and names.
    - **`/js`** – Place any vendor scripts here (e.g., `slick.min.js`, `swiper.min.js`).  
      Files will be copied to `dist/vendor/js/` with the same structure and names.
  - No bundling or npm install required. Drop the files in, commit them, and enqueue from the `dist/vendor` path in `functions.php`.
  - Keeps vendor libraries version-controlled and out of `node_modules`, ensuring they’re shipped with the theme regardless of environment.
- **`extras/`**
  - `helpers.php` → generic PHP helper functions
  - `setup.php` → theme setup (enqueue, supports, menus, etc.)
  - `theme-functions.php` → WordPress-specific functions and filters
  - `ajax.php` → central AJAX handlers
  - `shortcodes/` → custom shortcodes
  - `post-types/` → custom post type definitions
  - `integrations/` → third-party service or plugin integrations

## Conventions

- Assets always compiled into `dist/`:
  - CSS: `main.min.css`, `sections.min.css`, `pages/*.min.css`, `vendor.min.css`
  - JS: `main.min.js`, `admin.min.js`, `vendor.min.js`
- **Important (Sass modules):** Partial files compiled via `@use` do *not* inherit imports from their parents.  
  Add this line at the **top of any file** that relies on shared tokens/mixins:
  ```scss
  @use 'shared' as *;
  ```
  Ensure `src/scss/_shared.scss` re-exports your tokens/mixins, e.g.:
  ```scss
  // _shared.scss
  @forward 'variables';
  @forward 'mixins';
  ```
- External libraries should be imported through `vendor.js` and `vendor.scss` for consistency (and enqueued as `vendor.min.js` / `vendor.min.css`).

![Sapling Logo](./sapling.svg)
# Sapling Child Theme

The child theme builds on the Sapling starter, providing a structure for overrides and project-specific customization.

---

## File Structure

- **`src/scss`**
  - `_globals.scss`, `_variables.scss`, `_partials.scss` → base overrides
  - `pages/` → page-specific styles (`about.scss` → `dist/css/pages/about.min.css`)
  - `sections/` → reusable block/section styles (bundled into `sections.min.css`)
  - `main.scss` → imports parent globals + variables, then applies child overrides
- **`src/js`**
  - `main.js` → default scripts for the child theme
  - `admin.js` → WordPress admin-side scripts
  - `vendor.js` → entry for external libraries (e.g., Slick, Swiper)
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
- Shared SCSS variables and mixins injected at the top of each entry via `_shared.scss`.
- External libraries should be imported through `vendor.js` and `vendor.scss` for consistency.

# twwp-theme-child

- SCSS root: `/scss` with `_globals.scss`, `_variables.scss`, `_partials.scss`, plus folders:
  - `/scss/pages` and `/scss/sections` (committed via `.gitkeep`)
- Entry `scss/main.scss` imports **parent** `globals` + `variables`, then child overrides.
- Extras folder with backend scaffolding.

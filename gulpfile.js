const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const esbuild = require('esbuild');

const paths = {
  // Theme sources
  scss: 'src/scss/**/*.scss',
  js: 'src/js/**/*.js',

  // Vendor sources (manual files you add to the theme repo)
  vendorCss: 'src/vendor/css/**/*.{css,map}',
  vendorJs: 'src/vendor/js/**/*.{js,map}',

  // Outputs
  outCss: 'dist/css',
  outJs: 'dist/js',
  outVendorCss: 'dist/vendor/css',
  outVendorJs: 'dist/vendor/js',
};

// Will let SCSS @use/@import resolve from both 
// theme and vendor packages (if ever needed)
const sassIncludePaths = ['src/scss', 'node_modules'];

function clean() {
  const out = path.resolve('dist');
  return new Promise((resolve, reject) => {
    fs.rm(out, { recursive: true, force: true }, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

/* ======================
   CSS — always sourcemaps + minify (theme)
   ====================== */

function stylesMain() {
  return gulp.src(['src/scss/main.scss'], { allowEmpty: true })
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(
      sass.sync({
        outputStyle: 'expanded',
        includePaths: sassIncludePaths,
      }).on('error', sass.logError)
    )
    .pipe(postcss([
      require('autoprefixer')(),
      require('cssnano')(),
    ]))
    .pipe(rename({ basename: 'main', suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.outCss));
}

// gulpfile.js (replace stylesSections)
function stylesSections() {
  return gulp.src([
      'src/scss/sections/**/*.scss',
      '!src/scss/sections/**/_*.scss',
    ], { allowEmpty: true })
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(
      sass.sync({
        outputStyle: 'expanded',
        includePaths: sassIncludePaths,
      }).on('error', sass.logError)
    )
    .pipe(postcss([
      require('autoprefixer')(),
      require('cssnano')(),
    ]))
    .pipe(rename((p) => {
      p.dirname = 'sections';
      p.basename = p.basename + '.min';
      p.extname = '.css';
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.outCss));
}

function stylesPages() {
  return gulp.src(['src/scss/pages/*.scss'], { allowEmpty: true })
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(
      sass.sync({
        outputStyle: 'expanded',
        includePaths: sassIncludePaths,
      }).on('error', sass.logError)
    )
    .pipe(postcss([
      require('autoprefixer')(),
      require('cssnano')(),
    ]))
    .pipe(rename((p) => {
      p.dirname = 'pages';
      p.basename = p.basename + '.min';
      p.extname = '.css';
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.outCss));
}

/* ======================
   JS — base + per-section + per-page (esbuild)
   ====================== */

// Base theme JS: src/js/*.js -> dist/js/{name}.min.js
function scripts() {
  const srcDir = 'src/js';
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(paths.outJs, { recursive: true });
    return Promise.resolve();
  }

  const entryPoints = fs.readdirSync(srcDir)
    .filter(f => f.endsWith('.js') && !f.startsWith('_'))
    .map(f => path.join(srcDir, f));

  if (entryPoints.length === 0) {
    fs.mkdirSync(paths.outJs, { recursive: true });
    return Promise.resolve();
  }

  fs.mkdirSync(paths.outJs, { recursive: true });

  return esbuild.build({
    entryPoints,
    outdir: paths.outJs,
    bundle: true,
    format: 'iife',
    target: ['es2018'],
    sourcemap: true,
    minify: true,
    entryNames: '[name].min',
    legalComments: 'none',
    logLevel: 'silent',
    // don’t bundle jQuery; WP supplies it
    external: ['jquery'],
  });
}

// Sections JS: src/js/sections/*.js -> dist/js/sections/{name}.min.js
function scriptsSections() {
  const srcDir = 'src/js/sections';
  const outDir = path.join(paths.outJs, 'sections');

  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(outDir, { recursive: true });
    return Promise.resolve();
  }

  const entryPoints = fs.readdirSync(srcDir)
    .filter(f => f.endsWith('.js') && !f.startsWith('_'))
    .map(f => path.join(srcDir, f));

  if (entryPoints.length === 0) {
    fs.mkdirSync(outDir, { recursive: true });
    return Promise.resolve();
  }

  fs.mkdirSync(outDir, { recursive: true });

  return esbuild.build({
    entryPoints,
    outdir: outDir,
    bundle: true,
    format: 'iife',
    target: ['es2018'],
    sourcemap: true,
    minify: true,
    entryNames: '[name].min',
    legalComments: 'none',
    logLevel: 'silent',
    external: ['jquery'],
  });
}

// Pages JS: src/js/pages/*.js -> dist/js/pages/{name}.min.js
function scriptsPages() {
  const srcDir = 'src/js/pages';
  const outDir = path.join(paths.outJs, 'pages');

  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(outDir, { recursive: true });
    return Promise.resolve();
  }

  const entryPoints = fs.readdirSync(srcDir)
    .filter(f => f.endsWith('.js') && !f.startsWith('_'))
    .map(f => path.join(srcDir, f));

  if (entryPoints.length === 0) {
    fs.mkdirSync(outDir, { recursive: true });
    return Promise.resolve();
  }

  fs.mkdirSync(outDir, { recursive: true });

  return esbuild.build({
    entryPoints,
    outdir: outDir,
    bundle: true,
    format: 'iife',
    target: ['es2018'],
    sourcemap: true,
    minify: true,
    entryNames: '[name].min',
    legalComments: 'none',
    logLevel: 'silent',
    external: ['jquery'],
  });
}

/* ======================
   Vendors — copy-only (no bundling, no transform)
   Place files under:
   - src/vendor/css/...   → dist/vendor/css/...
   - src/vendor/js/...    → dist/vendor/js/...
   ====================== */

function vendorCss() {
  return gulp.src(paths.vendorCss, { allowEmpty: true })
    .pipe(plumber())
    .pipe(gulp.dest(paths.outVendorCss));
}

function vendorJs() {
  return gulp.src(paths.vendorJs, { allowEmpty: true })
    .pipe(plumber())
    .pipe(gulp.dest(paths.outVendorJs));
}

/* ======================
   Watch / Tasks
   ====================== */

function watchAll() {
  // Everything that feeds main.scss, but exclude sections/ and pages/
  gulp.watch(
    [
      'src/scss/**/*.scss',
      '!src/scss/sections/**',
      '!src/scss/pages/**',
    ],
    stylesMain
  );

  // All section styles
  gulp.watch('src/scss/sections/**/*.scss', stylesSections);

  // All page styles
  gulp.watch('src/scss/pages/**/*.scss', stylesPages);

  // JS
  gulp.watch('src/js/*.js', scripts);
  gulp.watch('src/js/sections/**/*.js', scriptsSections);
  gulp.watch('src/js/pages/**/*.js', scriptsPages);

  // Vendor assets
  gulp.watch(paths.vendorCss, vendorCss);
  gulp.watch(paths.vendorJs, vendorJs);
}

const dev = gulp.series(
  clean,
  gulp.parallel(
    stylesMain, stylesSections, stylesPages,
    scripts, scriptsSections, scriptsPages,
    vendorCss, vendorJs
  )
);

const build = gulp.series(
  clean,
  gulp.parallel(
    stylesMain, stylesSections, stylesPages,
    scripts, scriptsSections, scriptsPages,
    vendorCss, vendorJs
  )
);

exports.clean = clean;
exports.styles = gulp.parallel(stylesMain, stylesSections, stylesPages);
exports.scripts = gulp.parallel(scripts, scriptsSections, scriptsPages);
exports.vendors = gulp.parallel(vendorCss, vendorJs);
exports.dev = dev;
exports.build = build;
exports.watch = gulp.series(dev, watchAll);

const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const concat = require('gulp-concat');
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

// will let SCSS @use/@import resolve from both theme and vendor packages (if ever needed)
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

function stylesSections() {
  return gulp.src(['src/scss/sections/**/*.scss'], { allowEmpty: true })
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
    .pipe(concat('sections.css'))
    .pipe(rename({ basename: 'sections', suffix: '.min' }))
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
      // Outputs dist/css/pages/{page}.min.css
      p.dirname = 'pages';
      p.basename = p.basename + '.min';
      p.extname = '.css';
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.outCss));
}

/* ======================
   JS — always sourcemaps + minify (theme)
   ====================== */

function scripts() {
  const srcDir = 'src/js';
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(paths.outJs, { recursive: true });
    return Promise.resolve();
  }

  const entryPoints = fs.readdirSync(srcDir)
    .filter(f => f.endsWith('.js'))
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
  // Theme SCSS
  gulp.watch(['src/scss/_shared.scss', 'src/scss/main.scss'], stylesMain);
  gulp.watch(['src/scss/_shared.scss', 'src/scss/sections/**/*.scss'], stylesSections);
  gulp.watch(['src/scss/_shared.scss', 'src/scss/pages/*.scss'], stylesPages);

  // Theme JS
  gulp.watch(paths.js, scripts);

  // Vendor assets (copy only)
  gulp.watch(paths.vendorCss, vendorCss);
  gulp.watch(paths.vendorJs, vendorJs);
}

const dev = gulp.series(
  clean,
  gulp.parallel(stylesMain, stylesSections, stylesPages, scripts, vendorCss, vendorJs)
);

const build = gulp.series(
  clean,
  gulp.parallel(stylesMain, stylesSections, stylesPages, scripts, vendorCss, vendorJs)
);

exports.clean = clean;
exports.styles = gulp.parallel(stylesMain, stylesSections, stylesPages);
exports.scripts = scripts;
exports.vendors = gulp.parallel(vendorCss, vendorJs);
exports.dev = dev;
exports.build = build;
exports.watch = gulp.series(dev, watchAll);

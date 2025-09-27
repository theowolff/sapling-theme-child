const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const header = require('gulp-header');
const esbuild = require('esbuild'); // native API

const paths = {
  scss: 'src/scss/**/*.scss',
  js: 'src/js/**/*.js',
  outCss: 'dist/css',
  outJs: 'dist/js',
};

// Inject this at the top of each SCSS entry so mixins/vars are always available
// Assumes src/scss/_shared.scss exists and @forwards variables/mixins/etc.
const sharedHeader = "@use 'shared' as *;\n";

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
  CSS — always sourcemaps + minify
  ====================== */

function stylesMain() {
  return gulp.src(['src/scss/main.scss'], { allowEmpty: true })
    .pipe(plumber())
    .pipe(header(sharedHeader))
    .pipe(sourcemaps.init())
    .pipe(
      sass.sync({
        outputStyle: 'expanded',
        includePaths: ['src/scss'],
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
    .pipe(header(sharedHeader))
    .pipe(sourcemaps.init())
    .pipe(
      sass.sync({
        outputStyle: 'expanded',
        includePaths: ['src/scss'],
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
    .pipe(header(sharedHeader))
    .pipe(sourcemaps.init())
    .pipe(
      sass.sync({
        outputStyle: 'expanded',
        includePaths: ['src/scss'],
      }).on('error', sass.logError)
    )
    .pipe(postcss([
      require('autoprefixer')(),
      require('cssnano')(),
    ]))
    .pipe(rename((p) => {
      // outputs dist/css/pages/{page}.min.css
      p.dirname = 'pages';
      p.basename = p.basename + '.min';
      p.extname = '.css';
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.outCss));
}

/* ======================
  JS — always sourcemaps + minify
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
  });
}

/* ======================
  Watch / Tasks
  ====================== */

function watchAll() {
  gulp.watch(['src/scss/_shared.scss', 'src/scss/main.scss'], stylesMain);
  gulp.watch(['src/scss/_shared.scss', 'src/scss/sections/**/*.scss'], stylesSections);
  gulp.watch(['src/scss/_shared.scss', 'src/scss/pages/*.scss'], stylesPages);
  gulp.watch(paths.js, scripts);
}

const dev = gulp.series(clean, gulp.parallel(stylesMain, stylesSections, stylesPages, scripts));
const build = gulp.series(clean, gulp.parallel(stylesMain, stylesSections, stylesPages, scripts));

exports.clean = clean;
exports.styles = gulp.parallel(stylesMain, stylesSections, stylesPages);
exports.scripts = scripts;
exports.dev = dev;
exports.build = build;
exports.watch = gulp.series(dev, watchAll);

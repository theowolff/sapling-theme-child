const gulp = require('gulp');
const del = require('del');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const gulpIf = require('gulp-if');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const { createGulpEsbuild } = require('gulp-esbuild');
const esbuild = createGulpEsbuild({ incremental: false });

const paths = { scss:'scss/**/*.scss', js:'src/js/**/*.js', outCss:'dist/css', outJs:'dist/js' };
const isProd = process.env.NODE_ENV === 'production';

function clean(){ return del(['dist']); }

function stylesMain(){
  return gulp.src(['scss/main.scss'], { allowEmpty: true })
    .pipe(plumber())
    .pipe(gulpIf(!isProd, sourcemaps.init()))
    .pipe(sass.sync({ outputStyle: 'expanded' }))
    .pipe(postcss([ require('autoprefixer')(), ...(isProd ? [require('cssnano')()] : []) ]))
    .pipe(rename({ basename: 'main', suffix: '.min' }))
    .pipe(gulpIf(!isProd, sourcemaps.write('.')))
    .pipe(gulp.dest(paths.outCss));
}

function stylesSections(){
  return gulp.src(['scss/sections/**/*.scss'], { allowEmpty: true })
    .pipe(plumber())
    .pipe(gulpIf(!isProd, sourcemaps.init()))
    .pipe(sass.sync({ outputStyle: 'expanded' }))
    .pipe(postcss([ require('autoprefixer')(), ...(isProd ? [require('cssnano')()] : []) ]))
    .pipe(concat('sections.css'))
    .pipe(rename({ basename: 'sections', suffix: '.min' }))
    .pipe(gulpIf(!isProd, sourcemaps.write('.')))
    .pipe(gulp.dest(paths.outCss));
}

function stylesPages(){
  return gulp.src(['scss/pages/*.scss'], { allowEmpty: true })
    .pipe(plumber())
    .pipe(gulpIf(!isProd, sourcemaps.init()))
    .pipe(sass.sync({ outputStyle: 'expanded' }))
    .pipe(postcss([ require('autoprefixer')(), ...(isProd ? [require('cssnano')()] : []) ]))
    .pipe(rename(function (p) {
      p.dirname = 'pages';
      p.basename = p.basename + '.min';
      p.extname = '.css';
    }))
    .pipe(gulpIf(!isProd, sourcemaps.write('.')))
    .pipe(gulp.dest(paths.outCss));
}

function scripts(){
  return gulp.src(['src/js/*.js'], { allowEmpty: true })
    .pipe(plumber())
    .pipe(esbuild({ bundle:true, format:'iife', target:'es2018', sourcemap:!isProd,
                    outdir: paths.outJs, entryNames:'[name]', legalComments:'none', minify:isProd }));
}

function watchAll(){
  gulp.watch('scss/main.scss', stylesMain);
  gulp.watch('scss/sections/**/*.scss', stylesSections);
  gulp.watch('scss/pages/*.scss', stylesPages);
  gulp.watch(paths.js, scripts);
}

const dev = gulp.series(clean, gulp.parallel(stylesMain, stylesSections, stylesPages, scripts));
const build = gulp.series(() => { process.env.NODE_ENV='production'; return Promise.resolve(); },
  clean, gulp.parallel(stylesMain, stylesSections, stylesPages, scripts));

exports.clean = clean;
exports.styles = gulp.parallel(stylesMain, stylesSections, stylesPages);
exports.scripts = scripts;
exports.dev = dev;
exports.build = build;
exports.watch = gulp.series(dev, watchAll);

const { dest, parallel, src, series, watch } = require('gulp');
const { deleteSync } = require('del');

const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const wiredep = require('wiredep').stream;
const eslint = require('gulp-eslint');
const lazypipe = require('lazypipe');
const useref = require('gulp-useref');
const gulpif = require('gulp-if');
const uglify = require('gulp-uglify');
const child = require('child_process');
const log = require('gutil-color-log');

// Delete files that will be regenerated
function clean(cb) {
  console.log("Deleting files...");
  let deletedFiles = deleteSync([
    '_includes/foot.html', 
    '_includes/head.html', 
    'css/**/*.*', 
    'js/**/*.*'
  ], { dryRun: false });
  console.log(deletedFiles);
  cb();
}

// Lint, build and minify CSS
function css(cb) {
  return src('__sass/**/*.scss')
    .pipe(sass({
      silenceDeprecations: ['color-functions', 'global-builtin', 'import']
    }).on('error', sass.logError))
    .pipe(dest('css'))
    .pipe(sourcemaps.init())
    .pipe(cleanCSS())
    .pipe(rename({suffix:'.min'}))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('css'));
}

// Wire bower dependencies into head and foot includes
function wireDependencies(cb) {
  return src('__includes/*.html')
    .pipe(wiredep())
    .pipe(dest('__includes'));
}

// Lint custom Javascript
function lintJS(cb) {
  return src('__js/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

// Minify Javascript
function js(cb) {
  const processJS = lazypipe()
    .pipe(() => sourcemaps.init())
    .pipe(() => uglify())
    .pipe(() => sourcemaps.write('.'))
    .pipe(() => dest('.'));

  return src('__includes/**/*.html')
    .pipe(useref())
    .pipe(gulpif('*.js', processJS()))
    .pipe(gulpif('*.html', dest('_includes')));
}

// Build the site using Jekyll, serve it, and watch for changes
function jekyllServe(cb) {
  const jekyll = child.spawn('jekyll', [
    'serve', 
    '--livereload',
    '--drafts',
    '--future'
  ]);
  const jekyllLogger = (buffer) => {
    buffer.toString()
      .split(/\n/)
      .forEach((message) => log('yellow', 'Jekyll: ' + message));
  };
  jekyll.stdout.on('data', jekyllLogger);
  jekyll.stderr.on('data', jekyllLogger);
  cb();
}

// Watch CSS and Javascript for changes
function liveReload() {
  watch('__sass/**/*.scss', css),
  watch('__js/**/*.js', series(lintJS, js))
};

//-----------------------------------------------------------------------------
// Main 'tasks':
// - build: build the site
// - liveReload: watch CSS and Javascript for changes
// - Default: build and then watch for changes
//-----------------------------------------------------------------------------
exports.build = series(
  clean, 
  parallel(css, wireDependencies),
  lintJS,
  js, 
  jekyllServe
);

exports.liveReload = liveReload;

exports.default = series(
  clean, 
  parallel(css, wireDependencies),
  lintJS,
  js, 
  jekyllServe,
  liveReload
);

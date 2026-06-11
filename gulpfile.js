import { dest, src, series, watch } from 'gulp';
import { deleteSync } from 'del';
import gulpSassPlugin from 'gulp-sass';
import * as dartSass from 'sass';
import cleanCSS from 'gulp-clean-css';
import rename from 'gulp-rename';
import eslint from 'gulp-eslint-new';
import concat from 'gulp-concat';
import merge from 'merge-stream';
import terser from 'gulp-terser';
import { spawn } from 'child_process';
import chalk from 'chalk';

const sass = gulpSassPlugin(dartSass);

// Delete files that will be regenerated
function clean(cb) {
  console.log("Deleting files...");
  let deletedFiles = deleteSync([
    'css/**/*.*',
    'js/**/*.*'
  ], { dryRun: false });
  console.log(deletedFiles);
  cb();
}

// Lint, build and minify CSS
function css() {
  return src('__sass/**/*.scss')
    .pipe(sass({
      loadPaths: ['node_modules'],
      silenceDeprecations: ['color-functions', 'global-builtin', 'if-function', 'import']
    }).on('error', sass.logError))
    .pipe(dest('css'))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('css'));
}

// Lint custom Javascript
function lintJS() {
  return src('__js/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

// Bundle and minify Javascript
function js() {
  const bundle = (input, output) =>
    src(input)
      .pipe(terser())
      .pipe(concat(output))
      .pipe(dest('js'));

  return merge(
    bundle('node_modules/jquery/dist/jquery.js', 'vendor.min.js'),
    bundle('node_modules/bootstrap/dist/js/bootstrap.js', 'bootstrap.min.js'),
    bundle('__js/**/*.js', 'app.min.js')
  );
}

// Build the site using Jekyll, serve it, and watch for changes
function jekyllServe(cb) {
  const jekyll = spawn('jekyll', [
    'serve',
    '--livereload',
    '--drafts',
    '--future'
  ]);
  const jekyllLogger = (buffer) => {
    buffer.toString()
      .split(/\n/)
      .forEach((message) => console.log(chalk.yellow('Jekyll: ' + message)));
  };
  jekyll.stdout.on('data', jekyllLogger);
  jekyll.stderr.on('data', jekyllLogger);
  cb();
}

// Watch CSS and Javascript for changes
function liveReload() {
  watch('__sass/**/*.scss', css);
  watch('__js/**/*.js', series(lintJS, js));
}

//-----------------------------------------------------------------------------
// Main 'tasks':
// - build: build the site
// - liveReload: watch CSS and Javascript for changes
// - Default: build and then watch for changes
//-----------------------------------------------------------------------------
export { clean, css, lintJS, js, liveReload };

export const build = series(clean, css, lintJS, js, jekyllServe);

export default series(clean, css, lintJS, js, jekyllServe, liveReload);

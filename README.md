# jekyll-starter

A starter template for a Jekyll site with a Gulp-based asset pipeline that handles SCSS compilation, JS bundling/minification, and livereload during development.

## What's included

- Jekyll for static site generation
- Bootstrap 5 + jQuery via Yarn, bundled by Gulp
- SCSS compilation with sourcemaps
- JS linting (ESLint), concatenation, and uglification with sourcemaps
- Jekyll livereload during development

## Installation

1. Clone or download this repository.
2. Run `bundle install` to install Jekyll and Ruby gems.
3. Run `yarn` to install Node dependencies (Gulp, Bootstrap, jQuery, etc.).
4. Run `gulp` to build and start the development server.
5. Open `http://127.0.0.1:4000`.

## Commands

| Command | Description |
|---|---|
| `gulp` | Full build, start Jekyll with livereload, watch for changes |
| `gulp build` | Full build and start Jekyll (no file watching) |
| `gulp liveReload` | Watch `__sass/` and `__js/` only (when Jekyll is already running) |

## Directory structure

```
.
├── __js/          # Your JS source files — built to js/app.min.js
├── __sass/        # Your SCSS source files — built to css/
├── _includes/     # Jekyll partials (head.html, foot.html, header.html, footer.html)
├── _layouts/      # Jekyll layouts
├── _site/         # Jekyll build output (not committed)
├── css/           # Built CSS (do not edit directly)
├── js/            # Built JS (do not edit directly)
├── _config.yml    # Jekyll configuration
├── eslint.config.js
├── gulpfile.js
├── Gemfile
└── package.json
```

## Asset pipeline

The Gulp build runs in this order: **clean → css → lintJS → js → jekyllServe**

- **CSS**: `__sass/**/*.scss` is compiled to `css/main.css` (unminified) and `css/main.min.css` (minified, with sourcemap).
- **JS**: Three bundles are produced in `js/`:
  - `vendor.min.js` — jQuery (from `node_modules`)
  - `bootstrap.min.js` — Bootstrap JS (from `node_modules`)
  - `app.min.js` — your code from `__js/`
- **Linting**: ESLint runs on `__js/**/*.js` before bundling and fails the build on errors.

Files in `css/` and `js/` are regenerated on every build — edit the sources in `__sass/` and `__js/` instead.

## Jekyll configuration

Edit `_config.yml` for site-wide settings. Changes to `_config.yml` require restarting Jekyll (re-run `gulp`). The dev server runs with `--livereload`, `--drafts`, and `--future` enabled.

Content pages are Markdown files at the repo root (`index.md`, `about.md`, etc.).

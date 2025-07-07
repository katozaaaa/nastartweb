const gulp = require('gulp');
const { src, dest, parallel, series, watch } = gulp;

// -----------------------------------------------------------------
// JS modules
// -----------------------------------------------------------------

// Babel plugin for Gulp
const babel = require('gulp-babel');

// JS minification
const uglify = require('gulp-uglify');

// -----------------------------------------------------------------
// CSS modules
// -----------------------------------------------------------------

// Parse CSS and add vendor prefixes to CSS rules using values
const autoprefixer = require('autoprefixer');

// CSS minification
const cssnano = require('cssnano');

// PostCSS gulp plugin
const postcss = require('gulp-postcss');

// Replace imports with file contents
const cssimport = require('gulp-cssimport');

// -----------------------------------------------------------------
// HTML modules
// -----------------------------------------------------------------

// HTML minification
const htmlminify = require('html-minifier-terser');

// Removes comments from JSON, JavaScript, CSS, HTML, etc. (use for HTML mostly)
const decomment = require('gulp-decomment');

// -----------------------------------------------------------------
// Other modules
// -----------------------------------------------------------------

const plumber = require('gulp-plumber');
// https://github.com/gulpjs/gulp/blob/master/docs/why-use-pump/README.md
const pump = require('pump');
const browsersync = require('browser-sync').create();
const fs = require('fs-extra');
const through2 = require('through2');
const PluginError = require('plugin-error');

const paths = {
    dirs: {
        dist: './dist',
        src: './src'
    },
    html: {
        src: './src/index.html',
        dest: './dist',
        watch: './src/index.html'
    },
    css: {
        src: './src/styles/style.css',
        dest: './dist/styles',
        watch: './src/styles/**/*.css'
    },
    js: {
        src: './src/scripts/**/*.js',
        dest: './dist/scripts',
        watch: './src/scripts/**/*.js'
    },
    assets: {
        src: './src/assets/**/*',
        dest: './dist/assets',
        watch: './src/assets/**/*'
    }
};

// -----------------------------------------------------------------
// PRIVATE TASKS
// -----------------------------------------------------------------

function clean(callback) {
    return fs.remove(paths.dirs.dist, callback);
}

const packTemplates = function () {
    return src(paths.html.src)
        .pipe(plumber())
        .pipe(
            decomment({
                trim: true
            })
        )
        .pipe(dest(paths.html.dest))
        .pipe(
            browsersync.reload({
                stream: true
            })
        );
};

const packStyles = function () {
    return src(paths.css.src, {
        sourcemaps: true
    })
        .pipe(plumber())
        .pipe(cssimport())
        .pipe(
            postcss([
                autoprefixer({
                    overrideBrowserslist: [ 'last 10 versions' ],
                    cascade: false
                })
            ])
        )
        .pipe(
            dest(paths.css.dest, {
                sourcemaps: true
            })
        )
        .pipe(
            browsersync.reload({
                stream: true
            })
        );
};

const packScripts = function () {
    return src(paths.js.src, {
        allowEmpty: true
    })
        .pipe(plumber())
        .pipe(
            babel({
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            modules: false
                        }
                    ]
                ]
            })
        )
        .pipe(dest(paths.js.dest))
        .pipe(
            browsersync.reload({
                stream: true
            })
        );
};

const packAssets = function () {
    return src(paths.assets.src, {
        encoding: false
    })
        .pipe(plumber())
        .pipe(dest(paths.assets.dest));
};

const startServe = function () {
    browsersync.init({
        server: {
            baseDir: paths.dirs.dist
        }
    });

    watch(paths.html.watch, packTemplates);
    watch(paths.css.watch, packStyles);
    watch(paths.js.watch, packScripts);
    watch(paths.assets.watch, packAssets);
};

const minifyHTML = function (callback) {
    pump(
        [
            src(paths.html.dest + '/*.html'),
            _minifyHTML(),
            dest(paths.html.dest)
        ],
        callback
    );

    function _minifyHTML() {
        // using base template for gulp plugin
        return through2.obj(function (file, enc, callback) {
            if (file.isNull()) {
                callback(null, file);
                return;
            }

            if (file.isStream()) {
                callback(
                    new PluginError({
                        plugin: 'minifyHTML',
                        message: 'Streaming not supported'
                    })
                );

                return;
            }

            const data = file.contents.toString();

            htmlminify
                .minify(data, {
                    collapseWhitespace: true
                })
                .then(function (code) {
                    file.contents = Buffer.from(code);

                    callback(null, file);
                })
                .catch((err) => {
                    callback(
                        new PluginError({
                            plugin: 'minifyHTML',
                            message: err.message
                        })
                    );
                });
        });
    }
};

const minifyStyles = function () {
    return src(paths.css.dest + '/*.css')
        .pipe(postcss([ cssnano() ]))
        .pipe(dest(paths.css.dest));
};

const minifyScripts = function (callback) {
    pump(
        [ src(paths.js.dest + '/*.js'), uglify(), dest(paths.js.dest) ],
        callback
    );
};

const minify = parallel(minifyHTML, minifyStyles, minifyScripts);

// -----------------------------------------------------------------
// PUBLIC TASKS
// -----------------------------------------------------------------

const build = series(
    clean,
    parallel(packTemplates, packStyles, packScripts, packAssets),
    minify
);

const dev = series(build, startServe);

// -----------------------------------------------------------------
// EXPORT
// -----------------------------------------------------------------

exports.build = build;
exports.dev = dev;

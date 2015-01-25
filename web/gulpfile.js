/**
 * Created by w on 1/12/15.
 */
var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var reactify = require('reactify');
var gutil = require('gulp-util');
var watchify = require('watchify');
var concat = require('gulp-concat');
var symlink = require('gulp-symlink');
var rename = require("gulp-rename");
var sass = require('gulp-ruby-sass');
var svgmin = require('gulp-svgmin');
var svgSymbols = require('gulp-svg-symbols');
var destination = './client/dist/',
    destination_js = destination + 'js',
    destination_css = destination + 'css',
    destination_svg = destination + 'icons';
var webserver = require('gulp-webserver');
var libs = [
    'react/addons',
    'underscore',
    'immutable',
    'immutable/contrib/cursor',
    'node-uuid'
];

var getBundle = function() {
    var bundle = browserify({
        debug: true,
        cache: {},
        packageCache: {},
        fullPaths: true
    });
    bundle.transform(reactify, {
        "es6": true,
        "global": true
    });
/*    bundle.on('transform', function(tr, file) {
    });*/
    return bundle
};

gulp.task('dev-js', function() {
    var bundle = getBundle();
    bundle.add('./client/src/flux/app.js');
    bundle.on('bundle', function() {
        libs.forEach(function (lib) {
            bundle.external(lib);
        });
    });
    return bundle
        .bundle()
        .pipe(source('dev-bundle.js'))
        .pipe(gulp.dest(destination_js));
});
gulp.task('vendor-js', function() {
    var bundle = getBundle();
    bundle.on('bundle', function() {
        libs.forEach(function (lib) {
            bundle.require(lib);
        });
    });
    return bundle
        .bundle()
        .pipe(source('vendor-bundle.js'))
        .pipe(gulp.dest(destination_js));
});

gulp.task('css', function () {
    return gulp.src('./client/assets/css/*.css')
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest(destination_css));
});
gulp.task('sass', function () {
    return gulp.src(['./client/src/sass/app.sass','./client/src/sass/common_vars.json'])
        .pipe(sass({require: ['sass-json-vars']}))
        .on('error', function (err) { console.log(err.message); })
        .pipe(gulp.dest(destination_css));
});

gulp.task('watch', function () {
    var bundle = getBundle();
    var watch_bundle = watchify(bundle);
    bundle.add('./client/src/flux/app.js');
    bundle.on('bundle', function() {
        libs.forEach(function (lib) {
            bundle.external(lib);
        });
    });
    function rebundle() {
        var t = Date.now();
        gutil.log('Starting Watchify rebundle');
        return watch_bundle.bundle()
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source('dev-bundle.js'))
            .pipe(gulp.dest(destination_js))
            .on('end', function () {
                gutil.log('Finished bundling after:', gutil.colors.magenta(Date.now() - t + ' ms'));
            });
    }
    watch_bundle.on('update', rebundle);

    return rebundle();
});

gulp.task('create-symlink', function() {
    gulp.src('./client/assets/')
        .pipe(symlink('./client/dist/assets', { force: true }));
});



gulp.task('init', ['create-symlink','dev-js', 'vendor-js','sass'], function() {
    gulp.src('./client/src/templates/index-w.html')
        .pipe(rename('index.html'))
        .pipe(gulp.dest(destination));
});



gulp.task('svg-convert', function () {
    return gulp.src('./client/assets/icons/svg/*.svg')
        .pipe(svgSymbols({
            className:  '.svg-%f',
            templates: ['default-css']
        }))
        .pipe(rename('icons.data.svg.css'))
        .pipe(gulp.dest(destination_svg));
});

gulp.task('server', function() {
    gulp.src('./client/dist')
        .pipe(webserver({
            livereload: true,
            directoryListing: false,
            open: true,
            fallback: 'index.html'
        }));
});
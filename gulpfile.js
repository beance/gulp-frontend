'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

//-----------------
gulp.task('coffee', function () {
    return gulp.src('app/coffee/**/*.coffee')
        .pipe($.coffee({
            bare: true
        }))
        .on('error', handleErrors)
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('app/scripts'))
       ;
});
//-----------------
gulp.task('scripts', function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe($.size())
        ;
});
//-----------------
gulp.task('styles', function () {
    return gulp.src('app/styles/main.scss')
        .pipe($.rubySass({
            compass: true,
            bundleExec: false,
            sourcemap: false,
            sourcemapPath: '.',
            style: 'expanded',
            precision: 10
        }))
        .on('error', handleErrors)
        .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
        .pipe(gulp.dest('.tmp/styles'))
        .pipe($.size())
        ;

});
//-----------------
gulp.task('html', ['coffee', 'styles', 'scripts'], function () {
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');
    var assets = $.useref.assets({searchPath: '{.tmp,app}'});

    return gulp.src('app/*.html')
        .pipe(assets)
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});

//-----------------
gulp.task('images', function () {
    return gulp.src('app/images/**/*')
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe($.changed('app/images/**/*'))
        .pipe(gulp.dest('dist/images'))
        .pipe($.size());
});
//-----------------
gulp.task('fonts', function () {
    return $.bowerFiles()
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest('dist/fonts'))
        .pipe($.size());
});

//-----------------
gulp.task('extras', function () {
    return gulp.src(['app/*.*', '!app/*.html'], {dot: true})
        .pipe(gulp.dest('dist'));
});
//-----------------
gulp.task('default', ['clean'], function () {
    gulp.start('build');
});
//-----------------
gulp.task('build', ['html', 'images', 'fonts', 'extras']);
//-----------------
gulp.task('clean', function () {
    return gulp.src(['.tmp', 'dist'], {read: false}).pipe($.clean());
});
//-----------------
gulp.task('browserSync', ['clean', 'coffee', 'styles'], function () {
    browserSync({
        server: {
            baseDir: ['app', '.tmp']
        },
        files: [
            "app/*.html"
        ],
        port: 9000
        //notify: true
    });
});
//-----------------
gulp.task('setWatch', function () {
    global.isWatching = true;
});
//-----------------
gulp.task('watch', ['setWatch', 'browserSync'], function () {
    gulp.watch('app/styles/main.scss', ['styles',reload]);
    gulp.watch('app/styles/**/*.scss', ['styles',reload]);
    gulp.watch('app/styles/**/*.sass', ['styles',reload]);
    gulp.watch('app/coffee/**/*.coffee', ['coffee']);
    gulp.watch('app/scripts/**/*.js', ['scripts',reload]);
    gulp.watch('app/images/**/*', ['images',reload]);
    gulp.watch('bower.json', ['wiredep',reload]);
});
//-----------------
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;

    gulp.src('app/styles/*.scss')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app/styles'));

    gulp.src('app/*.html')
        .pipe(wiredep({
            directory: 'app/bower_components',
            exclude: ['bootstrap-sass-official']
        }))
        .pipe(gulp.dest('app'));
});
//-----------------

var handleErrors = module.exports = function() {
    var args = Array.prototype.slice.call(arguments);
    $.notify.onError({
        title: "Compile Error",
        message: "<%= error.message %>"
    }).apply(this, args);
    this.emit('end');
};
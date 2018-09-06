'use strict';

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload,
    cleanCSS = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    argv = require('yargs').argv,
    inject = require('gulp-inject'),
    concat = require('gulp-concat'),
    del = require('del'),
    runSeq = require('run-sequence'),
    gulpif = require('gulp-if');


const host = 'localhost';
const port = argv.port === undefined ? '61885' : argv.port;
const siteRoot = './SitefinityWebApp';
let env = argv.env === 'prod' ? 'prod' : 'dev';

const templatePath = siteRoot + "/Content";

/***********************
run default 'gulp' task for development
run 'gulp build' to build files for release
***********************/

gulp.task('sass', function () {
    return gulp.src(siteRoot + '/Content/src/scss/main.scss', { sourcemap: true })
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(gulpif(env === 'prod', autoprefixer({ browsers: ['last 2 versions', 'ie > 8', 'Safari >= 8'] })))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(siteRoot + '/Content/src/css/'))
        .pipe(browserSync.stream());
});

gulp.task('serve', ['sass'], function () {
    browserSync.init({
        proxy: host + ':' + port,
        open: true,
        notify: {
            styles: [
                "right: auto",
                "left: 0px",
                "z-index: 1000000000",
                "top: 0px",
                "bottom: auto",
                "background-color: #909090",
                "display: none",
                "font-family: sans-serif",
                "padding: 15px",
                "position: fixed",
                "margin: 0",
                "text-align: center",
                "font-size: 0.9em"
            ]
        }
    });

    gulp.watch(
        [
            siteRoot + '/Content/src/scss/**/*.scss',
            '!' + siteRoot + '/Content/src/scss/vendor/**/*'
        ],
        ['sass']
    );
    //gulp.watch(siteRoot + '/Scripts/*.js', ['inject', reload]);
    gulp.watch(siteRoot + '/Mvc/Views/**/*.cshtml', reload);
});

gulp.task('inject', ['inject:empty'], function () {
    let target = gulp.src(siteRoot + '/Mvc/Views/Layouts/Main.cshtml');
    if (env === 'dev') {
        const sources = gulp.src([
            templatePath + '/src/css/!(main)*.css',
            templatePath + '/src/css/main.css',
            templatePath + '/src/js/vendor/*.js',
            templatePath + '/src/js/!(main)*.js', //ignore main.js and add to end of stream
            templatePath + '/src/js/main.js'
        ]
        )
        return (target
            .pipe(inject(sources, { ignorePath: 'SitefinityWebApp/' }))
            .pipe(inject(gulp.src(templatePath + '/src/js/head/*.js'), {starttag:'<!-- inject:head:js -->', ignorePath: 'SitefinityWebApp/'}))
            .pipe(gulp.dest(siteRoot + '/Mvc/Views/Layouts'))
        )
    } else {
        return (target.
            pipe(
                inject(
                    gulp.src(
                        [templatePath + '/dist/css/main.min.css',
                        templatePath + '/dist/js/main.min.js']),
                    {
                        ignorePath: 'SitefinityWebApp/',
                        transform: function (filepath) {
                            arguments[0] = filepath + '?v=' + Date.now()
                            return inject.transform.apply(inject.transform, arguments)
                        }
                    }
                )
            )
            .pipe(
                inject(
                    gulp.src(templatePath + '/dist/js/main.head.min.js'),
                    {
                        starttag: '<!-- inject:head:js -->',
                        ignorePath: 'SitefinityWebApp/',
                        transform: function (filepath) {
                            arguments[0] = filepath + '?v=' + Date.now()
                            return inject.transform.apply(inject.transform, arguments)
                        }
                    }
                )
            )
            .pipe(gulp.dest(siteRoot + '/Mvc/Views/Layouts'))
        )
    }
});

gulp.task('inject:empty', function () {
    let target = gulp.src(siteRoot + '/Mvc/Views/Layouts/Main.cshtml');
    return target.pipe(inject(gulp.src([]), { empty: true }))
        .pipe(gulp.dest(siteRoot + '/Mvc/Views/Layouts'))
})

gulp.task('concatCSS', function () {
    return gulp.src([
        templatePath + '/src/css/**/*.css'
    ])
        .pipe(concat('main.min.css'))
        .pipe(cleanCSS(/*{level: {1: {specialComments:0}}}*/))
        .pipe(gulp.dest(templatePath + '/dist/css'))
});

gulp.task('concatJS', function () {
    return gulp.src([
        templatePath + '/src/js/vendor/*.js',
        templatePath + '/src/js/!(main)*.js', //ignore main.js and add to end of stream
        templatePath + '/src/js/main.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(templatePath + '/dist/js'))
});

gulp.task('concatHeadJS', function () {
    return gulp.src([
        templatePath + '/src/js/head/*.js'
    ])
        .pipe(concat('main.head.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(templatePath + '/dist/js'))
});

gulp.task('setProd', function () { env = 'prod' });

gulp.task('default', function (callback) {
    runSeq('sass', 'inject', 'serve', callback);
});

gulp.task('build', function (callback) {
    runSeq('setProd', ['sass'], ['concatCSS', 'concatJS', 'concatHeadJS'], 'inject', callback);
});


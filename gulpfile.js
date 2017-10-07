// include modules
var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    browserSync  = require('browser-sync'),
    concat       = require('gulp-concat'),
    uglify       = require('gulp-uglifyjs'),
    cssnano      = require('gulp-cssnano'),
    rename       = require('gulp-rename'),
    del          = require('del'),
    imagemin     = require('gulp-imagemin'),
    pngquant     = require('imagemin-pngquant'),
    cache        = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer');

// task for preproc sass & live reload
gulp.task('sass', function () {
    return gulp.src('app/sass/**/*.sass')
        .pipe(sass({outputStyle: 'expanded'}))
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({stream: true}))
});

// gulp task for minify & concat js libs
gulp.task('scripts', function () {
   return gulp.src([
       'app/libs/jquery/dist/jquery.min.js' // put library js files
   ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/js'))
});

// gulp task for minify css libs
gulp.task('css-libs', ['sass'], function () {
    return gulp.src('app/css/libs.css')
        .pipe(cssnano())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('app/css'))
});

// task for browser sync, web server
gulp.task('browser-sync', function () {
    browserSync({
       server : {
           baseDir: 'app'
       },
       notify: false
    });
});

// task for cleaning folders
gulp.task('clean', function () {
   return del.sync('dist');
});

// task for cleaning all cache
gulp.task('clear', function () {
    return cache.clearAll();
});

// task for minify images
gulp.task('img', function () {
    return gulp.src('app/img/**/*')
        .pipe(cache(
            imagemin({
                interlaced: true,
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [pngquant()]
            })
        ))
        .pipe(gulp.dest('dist/img'))
});

// gulp watch
gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function () {
    gulp.watch('app/sass/**/*.sass', ['sass']);
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload)
});

// task for creating build
gulp.task('build', ['clean', 'img', 'sass', 'scripts'], function () {
    // move css files to dist folder
    var buildCss = gulp.src([
        'app/css/main.css',
        'app/css/libs.min.css'
    ])
        .pipe(gulp.dest('dist/css'));

    // move fonts files to dist folder
    var buildFonts = gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'));

    // move js scripts to dist folder
    var buildJs = gulp.src('app/js/**/*')
        .pipe(gulp.dest('dist/js'))

    // move html files to dist folder
    var buildHtml = gulp.src('app/*.html')
        .pipe(gulp.dest('dist'));
});

// default gulp task
gulp.task('default', ['watch']);
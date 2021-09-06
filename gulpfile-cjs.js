const gulp = require('gulp');
const babel = require('gulp-babel');
const postcss = require('gulp-postcss');
const replace = require('gulp-replace');
const sync = require('browser-sync');
const del = require('del');
const rename = require('gulp-rename');
const fileinclude = require('gulp-file-include');
const uglify = require('gulp-uglify-es').default;
//const imagemin = require('gulp-imagemin');

// Server
const server = () => {
    sync.init({
        ui: false,
        notify: false,
        server: {
            baseDir: './dist'
        }
    });
};
exports.server = server;

// Html
const html = () => {
    return gulp.src(["src/*.html", "!src/_*.html"])
        .pipe(fileinclude())
        .pipe(gulp.dest("./dist"))
        .pipe(sync.stream())
}
exports.html = html;

// Js
const js = () => {
    return gulp.src("src/scripts/main.js")
        .pipe(fileinclude())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(gulp.dest("./dist/js"))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest("./dist/js"))
        .pipe(sync.stream())
}
exports.js = js;

// Styles
const styles = () => {
    return gulp.src('src/styles/*.css')
        .pipe(postcss([
            require('postcss-import'),
            require('postcss-media-minmax'),
            require('autoprefixer'),
            require('postcss-csso'),
        ]))
        .pipe(replace(/\.\.\//g, ''))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest('./dist/css/'))
        .pipe(sync.stream());
};
exports.styles = styles;

// Images
const images = () => {
    return gulp.src("src/images")
        .pipe(imagemin(
            {
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 4 // 0 to 7
            }))
        .pipe(gulp.dest("./dist/images"))
        .pipe(sync.stream())
}
exports.images = images;

// Clear dist folder
const clearDist = () => {
    return del("./dist")
}

// Paths
const paths = () => {
    return gulp.src('dist/*.html')
        .pipe(replace(
            /(<link rel="stylesheet" href=")styles\/(index)(.css">)/, '$1' + 'css/' + '$2' + '.min' + '$3'
        ))
        .pipe(replace(
            /(<script src=")scripts\/(main)(.js">)/, '$1' + 'js/' + '$2' + '.min' + '$3'
        ))
        .pipe(gulp.dest('dist'));
};

exports.paths = paths;

// Watch
const watch = () => {
    gulp.watch('src/styles/**/*.*', gulp.series('styles'));
    gulp.watch('src/scripts/**/*.*', gulp.series(js));
    gulp.watch('src/**/*.html', gulp.series(html, paths));
    //gulp.watch('src/images/**/*', gulp.series(images));


}
exports.watch = watch;


// Default
exports.default = gulp.series(
    clearDist,
    gulp.parallel(
        html, styles, js,
        //images
    ), paths,
    gulp.parallel(
        server, watch
    ),
);
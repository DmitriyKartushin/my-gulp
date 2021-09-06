import gulp from 'gulp';
import babel from 'gulp-babel';
import postcss from 'gulp-postcss';
import replace from 'gulp-replace';
import sync from 'browser-sync';
import del from 'del';
import rename from 'gulp-rename';
import fileinclude from 'gulp-file-include';
import uglify from 'gulp-uglify-es';
import pimport from 'postcss-import';
import minmax from 'postcss-media-minmax';
import imagemin from 'gulp-imagemin';
import webp from 'gulp-webp';
import webpHtml from 'gulp-webp-html';
import csso from 'postcss-csso';
import webpcss from 'gulp-webp-css';
import svgsprite from 'gulp-svg-sprite';
import ttf2woff from 'gulp-ttf2woff';
import ttf2woff2 from 'gulp-ttf2woff2';
import fonter from 'gulp-fonter';

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


// Html
const html = () => {
    return gulp.src(["src/*.html", "!src/_*.html"])
        .pipe(fileinclude())
        .pipe(webpHtml())
        .pipe(gulp.dest("./dist"))
        .pipe(sync.stream())
}


// Js
export const js = () => {

    return gulp.src("src/scripts/main.js")
        .pipe(fileinclude())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(gulp.dest("./dist/js"))
        .pipe(uglify.default())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest("./dist/js"))
        .pipe(sync.stream())
}

// Styles
export const styles = () => {
    return gulp.src('src/styles/*.css')
        .pipe(postcss([
            pimport,
            minmax,
            csso
        ]))
        .pipe(webpcss())
        .pipe(replace(/\.\.\//g, ''))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest('./dist/css/'))
        .pipe(sync.stream());
};

// Images
export const images = () => {
    return gulp.src("src/images/**/*.{jpg,png,svg,gif,ico,webp}")
        .pipe(webp({
            quality: 70
        }))
        .pipe(gulp.dest('./dist/images'))
        .pipe(gulp.src("src/images/**/*.{jpg,png,svg,gif,ico,webp}"))
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


// Clear dist folder
const clearDist = () => {
    return del("./dist")
}

//Fonts
export const fonts = () => {
    gulp.src('src/fonts/*.ttf')
        .pipe(ttf2woff())
        .pipe(gulp.dest('./dist/fonts'));
    return gulp.src('src/fonts/*.ttf')
        .pipe(ttf2woff2())
        .pipe(gulp.dest('./dist/fonts'));
};

gulp.task('otf2ttf', function () {
    return src(['src/fonts/*.otf'])
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(dest('src/fonts/'));
})

gulp.task('svgSprite', function () {
    return gulp.src(['src/iconsprites/*.svg'])
        .pipe(svgsprite({
            mode: {
                stack: {
                    sprite: "../icons/icons.svg",  //sprite file name
                    example: true
                }
            },
        }
        ))
        .pipe(gulp.dest("./dist/images"))
})


// Paths
export const paths = () => {
    return gulp.src('dist/*.html')
        .pipe(replace(
            /(<link rel="stylesheet" href=")styles\/(index)(.css">)/, '$1' + 'css/' + '$2' + '.min' + '$3'
        ))
        .pipe(replace(
            /(<script src=")scripts\/(main)(.js">)/, '$1' + 'js/' + '$2' + '.min' + '$3'
        ))
        .pipe(gulp.dest('dist'));
};


// Watch
export const watch = () => {
    gulp.watch('src/styles/**/*.*', gulp.series('styles'));
    gulp.watch('src/scripts/**/*.*', gulp.series(js));
    gulp.watch('src/**/*.html', gulp.series(html, paths));
    gulp.watch('src/images/**/*', gulp.series(images));

}


// Default
export default gulp.series(
    clearDist,
    gulp.parallel(
        html, styles, js,
        images, fonts
    ), paths,
    gulp.parallel(
        server, watch
    ),
);
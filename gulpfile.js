const gulp = require('gulp-help')(require('gulp'))
const gutil = require('gulp-util')
const pegjs = require('./gulp/gulp-pegjs')
const mocha = require('gulp-mocha')

gulp.task('default', ['generate:parser', 'test'])

gulp.task('generate:parser', function() {
    return gulp.src('*.pegjs')
        .pipe(pegjs({format: "commonjs"}))
        .pipe(gulp.dest('.'));
});

gulp.task('test', function() {
    return gulp.src('tests/*.test.js')
            // .pipe(mocha({reporter: 'nyan'}))
            .pipe(mocha({ reporter: 'spec'}))
});
const gulp = require('gulp-help')(require('gulp'))
const gutil = require('gulp-util')
const pegjs = require('./gulp/gulp-pegjs')
const mocha = require('gulp-mocha')
const runSequence = require('run-sequence')
const del = require('del');

gulp.task('default', function(cb) {
    runSequence('generate:parser', 'test', cb)
})

gulp.task('generate:parser', function(cb) {
    return runSequence('generate:parser:clean', 'generate:parser:pegjs', cb)
})

gulp.task('generate:parser:clean', function() {
    return del('wollok.js')
})

gulp.task('generate:parser:pegjs', function() {
    return gulp.src('*.pegjs')
        .pipe(pegjs())
        .pipe(gulp.dest('.'))
})

gulp.task('test', function() {
    return gulp.src('tests/*.test.js')
            .pipe(mocha({ reporter: 'spec'}))
            .pipe(mocha({ reporter: 'nyan'}))
})
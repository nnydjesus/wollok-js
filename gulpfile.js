const gulp = require('gulp-help')(require('gulp'))
const gutil = require('gulp-util')
const pegjs = require('./gulp/gulp-pegjs')
const mocha = require('gulp-mocha')
const runSequence = require('run-sequence');

gulp.task('default', function(cb) {
    runSequence('generate:parser', 'test', cb)
})

gulp.task('generate:parser', function() {
    return gulp.src('*.pegjs')
        .pipe(pegjs())
        .pipe(gulp.dest('.'))
})

gulp.task('test', function() {
    return gulp.src('tests/*.test.js')
            .pipe(mocha({ reporter: 'spec'}))
            .pipe(mocha({reporter: 'nyan'}))
})
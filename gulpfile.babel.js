import gulp, { dest, src } from 'gulp'

import babel from 'gulp-babel'
import del from 'del'
import eslint from 'gulp-eslint'
import mocha from 'gulp-mocha'
import pegjs from 'gulp-pegjs'

const task = gulp.task.bind(gulp)

task('clean', () => del(['dist', '*.tgz']))

task('compile', ['clean', 'peg', 'babel'])

task('peg', ['clean'], () =>
  src('src/**/*.pegjs')
    .pipe(pegjs({ format: 'commonjs' }))
    .pipe(dest('dist'))
)

task('babel', ['clean'], () =>
  src('src/**/*.js')
    .pipe(babel())
    .pipe(dest('dist'))
)

task('lint', ['compile'], () =>
  src(['src/**/*.js', 'tests/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
)

task('test', ['compile', 'lint'], () =>
  src(['tests/**/*.test.js', 'dist/**/*.js'])
    .pipe(mocha({ reporter: 'spec', compilers: ['js:babel-core/register'] }))
)
import gulp, { src, dest } from 'gulp'
import mocha from 'gulp-mocha'
import eslint from 'gulp-eslint'
import babel from 'gulp-babel'
import pegjs from 'gulp-pegjs'
import del from 'del'

const task = gulp.task.bind(gulp)

task('clean', () => del(['dist', '*.tgz']))

task('compile', ['lint', 'clean', 'wdk', 'peg', 'babel'])

task('peg', ['clean'], () =>
  src('src/**/*.pegjs')
    .pipe(pegjs({ format: 'commonjs' }))
    .pipe(dest('dist'))
)

task('wdk', ['clean'], () =>
  src('src/wdk/**/*.wlk')
    .pipe(dest('dist'))
)

task('babel', ['clean'], () =>
  src('src/**/*.js')
    .pipe(babel())
    .pipe(dest('dist'))
)

task('test', ['compile'], () =>
  src(['tests/**/*.test.js', 'dist/**/*.js'])
    .pipe(mocha({ reporter: 'spec', compilers: ['js:babel-core/register'] }))
)

task('lint', () =>
  src(['src/**/*.js', 'tests/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
)
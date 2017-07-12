import gulp from 'gulp'
import mocha from 'gulp-mocha'
import eslint from 'gulp-eslint'

gulp.task('default', ['test'])

gulp.task('test', () =>
  gulp.src('tests/**/*.test.js')
    .pipe(mocha({ reporter: 'spec', compilers: ['js:babel-core/register'] }))
)

gulp.task('lint', () =>
  gulp.src(['src/**/*.js', 'tests/**/*.test.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
)
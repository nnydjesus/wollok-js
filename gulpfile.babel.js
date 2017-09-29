import gulp, { dest, src, watch } from 'gulp'
import { readFileSync, writeFile } from 'fs'

import babel from 'gulp-babel'
import del from 'del'
import eslint from 'gulp-eslint'
import mocha from 'gulp-mocha'
import pegjs from 'gulp-pegjs'
import exec from 'exec'

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

task('wre', ['compile'], (cb) => {
  const { compiler, parser, linker } = require('./dist/index')
  const { default: natives } = require('./dist/wre/lang.natives.js')
  const lang = compiler(linker(parser(readFileSync('src/wre/lang.wlk', 'utf8'))), natives)
  writeFile('dist/wre/wre.txt', lang, () =>
    // exec('./node_modules/.bin/babel dist/wre/wre.js -o dist/wre/wre.js', cb)
    cb
  )
})

task('test', ['compile', 'lint'], () =>
  src(['tests/**/*.test.js', 'dist/**/*.js'])
    .pipe(mocha({ reporter: 'spec', compilers: ['js:babel-core/register'] }))
)

/* eslint prefer-arrow-callback: 0 */
task('watch', () => gulp.watch('src/**/*.js', ['compile']))
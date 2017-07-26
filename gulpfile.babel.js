import gulp, { dest, src } from 'gulp'
import { readFileSync, unlinkSync, writeFile } from 'fs'

import babel from 'gulp-babel'
import del from 'del'
import eslint from 'gulp-eslint'
import { exec } from 'child_process'
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

task('lint', ['compile', 'wre'], () =>
  src(['src/**/*.js', 'tests/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
)

task('wre', ['clean', 'compile'], (cb) => {
  const { compiler, parser, linker } = require('./dist/index')
  const lang = compiler(linker(parser(readFileSync('src/wre/lang.wlk', 'utf8'))))
  const natives = readFileSync('dist/wre/natives.js', 'utf8')
  unlinkSync('dist/wre/natives.js')
  writeFile('dist/wre/wre.js', `${natives}\n${lang}`, () =>
    exec('./node_modules/.bin/babel dist/wre/wre.js -o dist/wre/wre.js', cb)
  )
})

task('test', ['compile', 'wre', 'lint'], () =>
  src(['tests/**/*.test.js', 'dist/**/*.js'])
    .pipe(mocha({ reporter: 'spec', compilers: ['js:babel-core/register'] }))
)
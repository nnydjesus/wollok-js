import gulp, { src, dest } from 'gulp'
import mocha from 'gulp-mocha'
import eslint from 'gulp-eslint'
import babel from 'gulp-babel'
import pegjs from 'gulp-pegjs'
import del from 'del'
import { readFileSync, unlinkSync, writeFile } from 'fs'

const task = gulp.task.bind(gulp)

task('clean', () => del(['dist', '*.tgz']))

task('compile', ['lint', 'clean', 'peg', 'babel'])

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

task('test', ['compile', 'testNoCompile'])

task('testNoCompile', () =>
  src(['tests/**/*.test.js', 'dist/**/*.js'])
    .pipe(mocha({ reporter: 'spec', compilers: ['js:babel-core/register'] }))
)

task('lint', () =>
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
  writeFile('dist/wre/wre.js', `${natives}\n${lang}`, cb)
})

// TODO: Compile .wlk files and compress them along the natives file before packing.
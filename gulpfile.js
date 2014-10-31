var gulp = require('gulp');
var gutil = require('gulp-util');
var coffee = require('gulp-coffee');
var order = require('gulp-order');
var concat = require('gulp-concat');
var _ = require('lodash');

var paths = {
  srcFiles: [
    'remote-helpers',
    'remote-response-validator',
    'updateable-views',
    'remote-action',
    'remote-confirm',
    'remote-modal-view'
  ],
  srcDir: 'src/',
  distDir: 'dist/',
  tests: 'tests/**/*.coffee'
}

coffeescriptFiles = function() {
  return _.map(paths.srcFiles, function(fileName) {
    return paths.srcDir + fileName + ".coffee";
  })
}

javascriptFiles = function() {
  return _.map(paths.srcFiles, function(fileName) {
    return paths.distDir + fileName + ".js";
  })
}

console.log(coffeescriptFiles());

compileCoffee = function() {
  return gulp.src(coffeescriptFiles())
    .pipe(coffee().on('error', gutil.log))
}

gulp.task('compileSrc', function () {
  compileCoffee().pipe(gulp.dest('./dist/'))
});

gulp.task('concatenateSrc', function() {
  gulp.src(javascriptFiles())
    .pipe(concat('bellhopper.js'))
    .pipe(gulp.dest('./dist/'))
});

gulp.task('compileTests', function () {
  gulp.src(paths.tests)
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(concat('tests.js'))
    .pipe(gulp.dest('./dist/'))
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(coffeescriptFiles(), ['compileSrc', 'concatenateSrc']);
  gulp.watch(paths.tests, ['compileTests']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', [
  'compileSrc',
  'concatenateSrc',
  'compileTests',
  'watch']); 

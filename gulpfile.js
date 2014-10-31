var gulp = require('gulp');
var gutil = require('gulp-util');
var coffee = require('gulp-coffee');
var order = require('gulp-order');
var concat = require('gulp-concat');
var _ = require('lodash');

var fileNames = {
  src: [
    'remote-helpers',
    'remote-response-validator',
    'updateable-views',
    'remote-action',
    'remote-confirm',
    'remote-modal-view'
  ]
}

coffeescriptFiles = function() {
  return _.map(fileNames.src, function(fileName) {
    return "src/" + fileName + ".coffee";
  })
}

javascriptFiles = function() {
  return _.map(fileNames.src, function(fileName) {
    return "dist/" + fileName + ".js";
  })
}

console.log(coffeescriptFiles());

compileCoffee = function() {
  return gulp.src(coffeescriptFiles())
    .pipe(coffee({bare: true}).on('error', gutil.log))
}

gulp.task('compileSrc', function () {
  compileCoffee().pipe(gulp.dest('./dist/'))
});

gulp.task('concatenateSrc', function() {
  compileCoffee()
    .pipe(order(javascriptFiles()))
    .pipe(concat('bellhopper.js'))
    .pipe(gulp.dest('./dist/'))
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(coffeescriptFiles(), ['compileSrc', 'concatenateSrc']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['compileSrc', 'concatenateSrc', 'watch']); 

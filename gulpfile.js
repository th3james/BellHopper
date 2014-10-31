var gulp = require('gulp');
var gutil = require('gulp-util');
var coffee = require('gulp-coffee');

var paths = {src: 'src/**/*.coffee'}

gulp.task('coffee', function () {
  gulp.src(paths.src)
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest('./dist/'))
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(paths.src, ['coffee']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['coffee', 'watch']); 

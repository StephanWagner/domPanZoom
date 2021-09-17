var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var header = require('gulp-header');

var fileHeader = '/*! domPanZoom | https://github.com/StephanWagner/domPanZoom | MIT License | Copyright Stephan Wagner | https://stephanwagner.me */' + "\n";

// JavaScript
var scripts = [{
  name: 'domPanZoom',
  src: [
    './src/js/domPanZoom.js',
    './src/js/umd.js'
  ],
  dest: './dist/'
}];

// Config tasks
let defaultTasks = [];
let buildTasks = [];
let watchTasks = [];

// Config JavaScript tasks
for (let item of scripts) {

  // Concat JavaScript
  const jsConcat = function () {
    return gulp
      .src(item.src)
      .pipe(sourcemaps.init())
      .pipe(concat(item.name + '.js'))
      .pipe(header(fileHeader))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(item.dest));
  };

  // Store as a task
  gulp.task('jsConcat-' + item.name, jsConcat);

  // Add to default tasks
  defaultTasks.push('jsConcat-' + item.name);

  // Add to watch tasks
  watchTasks.push({
    src: item.srcWatch ? item.srcWatch : item.src,
    task: jsConcat
  });

  // Build JavaScript
  const jsBuild = function () {
    return gulp
      .src(item.dest + item.name + '.js')
      .pipe(rename(item.name + '.min.js'))
      .pipe(uglify())
      .pipe(header(fileHeader))
      .pipe(gulp.dest(item.dest));
  };

  // Store as a task
  gulp.task('jsBuild-' + item.name, jsBuild);

  // Add to build tasks
  buildTasks.push('jsBuild-' + item.name);
}

// Watch tasks
function watch() {
  for (const watchTask of watchTasks) {
    gulp.watch(watchTask.src, watchTask.task);
  }
}

exports.default = gulp.series(defaultTasks);
exports.watch = gulp.series(defaultTasks, watch);
exports.build = gulp.series(defaultTasks, buildTasks);

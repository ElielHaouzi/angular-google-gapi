/*global -$ */
'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

var config = {compile: 'dist'};

var pkg    = require('./package.json'),
    moduleFiles = ['src/gdata.js', 'src/gclient.js', 'src/gapi.js', 'src/gauth.js'];

gulp.task('jshint', function() {
	var options = {curly: true, immed: true, newcap: true, noarg: true,
    sub: true, boss: true, eqnull: true, globalstrict: true, strict: false
	};
  var sourcesFiles = moduleFiles.concat(['gulpfiles.js']);

  return gulp.src(sourcesFiles)
    .pipe($.jshint(options))
    .pipe($.jshint.reporter('jshint-stylish'))
});

gulp.task('compile', function () {
  gulp.src(moduleFiles)
    .pipe($.concat('angular-google-gapi.js'))
    .pipe($.ngAnnotate())
    .pipe($.uglify())
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(config.compile));

  gulp.src(moduleFiles)
    .pipe($.concat('angular-google-gapi.js'))
    .pipe(gulp.dest(config.compile));
});

gulp.task('clean', require('del').bind(null, [config.compile]));

gulp.task('default', ['clean', 'jshint', 'compile'], function() {
  return gulp.src(config.compile+'/**/*').pipe($.size({title: 'compile', gzip: true}));
});

// modules
var browserSync = require('browser-sync');
var del = require('del');
var gulp = require('gulp');
var gutil = require('gulp-util');
var imagemin = require('gulp-imagemin');
var inlineCss = require('gulp-inline-css');
var minifyHTML = require('gulp-minify-html');
var path = require('path');
var prefix = require('gulp-autoprefixer');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');


// config
var config = {
	dev: gutil.env.dev,
	src: {
		emails: 'src/emails/*.html',
		styles: 'src/styles/**/*.scss',
		images: 'src/images/**/*'
	},
	dest: 'dist'
};


// setup/teardown
gulp.task('setup', function (cb) {
	del([config.dest], cb);
});

gulp.task('teardown', function (cb) {
	del([config.dest + '/styles'], cb);
});


// styles
gulp.task('styles', function () {
	return gulp.src(config.src.styles)
		.pipe(sass({
			errLogToConsole: true
		}))
		.pipe(prefix('last 1 version'))
		.pipe(gulp.dest(config.dest + '/styles'));
});


// images
gulp.task('images', function () {
	return gulp.src(config.src.images)
		.pipe(imagemin())
		.pipe(gulp.dest(config.dest + '/images'));
});


// assemble
gulp.task('assemble', ['styles'], function () {
	return gulp.src(config.src.emails)
		.pipe(inlineCss({
			preserveMediaQueries: true
		}))
		.pipe(minifyHTML({
			quotes: true
		}))
		.pipe(gulp.dest(config.dest));
});


// dev environment
gulp.task('browser-sync', function () {
	browserSync({
		server: {
			baseDir: config.dest
		},
		notify: false
	});
});


gulp.task('watch', ['browser-sync'], function () {
	gulp.watch(config.src.emails, ['assemble', browserSync.reload]);
	gulp.watch(config.src.styles, ['assemble', browserSync.reload]);
	gulp.watch(config.src.images, ['images', browserSync.reload]);
});

// default task
gulp.task('default', ['setup'], function () {
	runSequence('images', 'assemble', function () {
		if (config.dev) {
			gulp.start('watch');
		} else {
			gulp.start('teardown');
		}
	});
});

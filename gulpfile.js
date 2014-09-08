// modules
var browserSync = require('browser-sync');
var path = require('path');
var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var inlineCss = require('gulp-inline-css');
var minifyHTML = require('gulp-minify-html');
var plumber = require('gulp-plumber');
var prefix = require('gulp-autoprefixer');
var rimraf = require('gulp-rimraf');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');


// config
var config = {
	dev: true,
	src: {
		emails: 'src/emails/*.html',
		styles: 'src/styles/**/*.scss',
		images: 'src/images/**/*'
	},
	dest: 'public/'
};


// setup/teardown
gulp.task('setup', function () {
	return gulp.src(config.dest, { read: false })
		.pipe(rimraf({ force: true }));
});

gulp.task('teardown', function () {
	return gulp.src(config.dest + '/styles', { read: false })
		.pipe(rimraf({ force: true }));
});


// styles
gulp.task('styles', function () {
	return gulp.src(config.src.styles)
		.pipe(plumber())
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
		.pipe(plumber())
		.pipe(inlineCss({
			url: 'file:\\\\' + __dirname + '/public/',
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


gulp.task('dev', ['setup', 'watch'], function () {
	runSequence('images', 'assemble');
});


// default task
gulp.task('default', ['setup'], function () {
	config.dev = false;
	runSequence('images', 'assemble', 'teardown');
});


// modules
var browserSync = require('browser-sync');
var gulp = require('gulp');
var inlineCss = require('gulp-inline-css');
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
		styles: 'src/styles/**/*.scss'
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


// assemble
gulp.task('assemble', ['styles'], function () {
	return gulp.src(config.src.emails)
		.pipe(plumber())
		.pipe(inlineCss({
			url: 'http://localhost:3000/'
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
});


gulp.task('dev', ['watch'], function () {
	runSequence('assemble');
});


// default task
gulp.task('default', ['setup'], function () {
	config.dev = false;
	runSequence('assemble', 'teardown');
});

var gulp = require('gulp');
var tsregister = require('ts-node/register');
var tsconfig = require('./tsconfig.json');
var path = require('path');
var ts = require('gulp-typescript');
var rename = require('gulp-rename');

var config = {
	index: 'src/index.ng2.html',
	css:['src/**/*.scss'],
	staticFiles: [
		'src/**/*',
		'!src/**/*.ts',
		'node_modules/systemjs/dist/system.js',
		'node_modules/angular2/bundles/angular2-polyfills.js'
		],
  angular2: 'node_modules/angular2/**/*.js',
  'angular-polyfills': 'node_modules/angular2/bundles/angular2-polyfills.min.js',
  angularfire2: 'node_modules/angularfire2/**/*.js',
  typescript: 'node_modules/typescript/**/*.js',
  rxjs: 'node_modules/rxjs/**/*.js',
  'reflect-metadata': 'node_modules/reflect-metadata/**/*.js',
  systemjs: 'node_modules/systemjs/**/*.js',
  'zone.js': 'node_modules/zone.js/**/*.js',
  firebase: 'node_modules/firebase/**/*.js',
	dist: './dist',
  vendor: './dist/vendor',
	system: {
		configFile: 'system.config.js'
	}
};

require('./tasks/build').build(gulp, config);
require('./tasks/copy').copy(gulp, config);
require('./tasks/styles').compile(gulp, config);
require('./tasks/compile').compile(gulp, config);

gulp.task('build:http2-full', [
    'copy:dev',
    'copy:angular',
    'copy:angularfire2',
    'copy:typescript',
    'copy:rxjs',
    'copy:reflect-metadata',
    'copy:zone.js',
    'copy:firebase',
    'copy:systemjs',
    'compile:file-by-file',
    'copy:index-to-static',
    'compile:sass'
  ], () => {
    console.log('no op');
});

gulp.task('copy:angular', makeCopyFn('angular2'));
gulp.task('copy:angularfire2', makeCopyFn('angularfire2'));
gulp.task('copy:typescript', makeCopyFn('typescript'));
gulp.task('copy:rxjs', makeCopyFn('rxjs'));
gulp.task('copy:reflect-metadata', makeCopyFn('reflect-metadata'));
gulp.task('copy:systemjs', makeCopyFn('systemjs'));
gulp.task('copy:zone.js', makeCopyFn('zone.js'));
gulp.task('copy:firebase', makeCopyFn('firebase'));



gulp.task('copy:index-to-static', () => {
  return gulp.src('./src/index.ng2.html')
      .pipe(rename('./index.html'))
      .pipe(gulp.dest('dist'))
})

gulp.task('compile:file-by-file', () => {
  return gulp.src(['src/**/*.ts', 'typings/main.d.ts'])
      .pipe(ts({
        noImplicitAny: false,
        typescript: require('typescript'),
        module: 'system',
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        moduleResolution: 'node'
      }))
      .pipe(gulp.dest('dist'));
});

// gulp.task('copy:angular', () => {
//   return gulp.src(['node_modules/angular2/ts/**/*.ts', 'typings/main.d.ts'])
//       .pipe(ts({
//         noImplicitAny: false,
//         typescript: require('typescript'),
//         module: 'system',
//         emitDecoratorMetadata: true,
//         experimentalDecorators: true,
//         moduleResolution: 'node'
//       }))
//       .pipe(gulp.dest('dist/vendor/angular2'));
// });

function makeCopyFn(name) {
  return () => {
    return gulp.src(config[name])
      .pipe(gulp.dest(path.resolve(config.vendor, name)));
  }
}

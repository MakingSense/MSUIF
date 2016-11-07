// Require Gulp
var gulp = require('gulp'),
// Require Gulp-sass plugin
sass = require('gulp-sass'),
// Require Gulp-bower to install dependencies
bower = require('gulp-bower'),
// Require Sassdoc
sassdoc = require('sassdoc'),
// Require Sourcemaps
sourcemaps = require('gulp-sourcemaps'),
// Require Browser Sync for livereloading
browserSync = require('browser-sync').create(),
// Require Del to clean dev folder
del = require('del'),
// Require Process HTML
processHtml = require('gulp-processhtml'),
// Require iconfont generator plugin
iconfont = require('gulp-iconfont'),
iconfontCss = require('gulp-iconfont-css'),
// Require PostCSS
postcss = require('gulp-postcss'),
// Require PostCSS autoprefixer
autoprefixer = require('autoprefixer'),
// Require Cssnano
cssnano = require('cssnano'),
// Require Css-MQpacker
mqpacker = require('css-mqpacker'),
// Kraken image optimization plugin
kraken = require('gulp-kraken'),
// SFTP deploy task
sftp = require('gulp-sftp');

// Project settings
var config = {
  // Folders for assets, development environment
  folderDev: {
    base: 'dev',
    css: 'dev/css',
    fonts: 'dev/fonts',
    images: 'dev/img',
    js: 'dev/js'
  }, // If this path gets changed, remember to update .gitignore with the proper path to ignore images and css
  folderAssets: {
    base: 'assets',
    styles: 'assets/styles',
    images: 'assets/img',
    js: 'assets/js'
  },
  folderBower: {
    base: 'bower_components',
    jeet: 'bower_components/jeet.gs',
    normalize: 'bower_components/normalize-scss',
    sassyCast: 'bower_components/sassy-cast',
    jquery: 'bower_components/jquery-latest'
  },
  postCSS: {
    processors : [
      autoprefixer({browsers: [      
      // 'Android >= 2.3',
      // 'BlackBerry >= 7',
      // 'Chrome >= 9',
      // 'Firefox >= 4',
      // 'Explorer >= 9',
      // 'iOS >= 5',
      // 'Opera >= 11',
      // 'Safari >= 5',
      // 'OperaMobile >= 11',
      // 'OperaMini >= 6',
      // 'ChromeAndroid >= 9',
      // 'FirefoxAndroid >= 4',
      // 'ExplorerMobile >= 9',
      'last 2 versions', 
      '> 1%', 
      'last 3 iOS versions', 
      'Firefox > 20', 
      'ie 9' //This is a Default Autoprefixer Config. In case that you need to add other browser support uncomment from above. 
      ]}),
      mqpacker(), 
      cssnano(),
    ]
  },
  // Sassdoc task options
  sassDocOptions : {
    dest: 'assets/doc/',
    display: {
      watermark: false
    },
    groups: {
      'undefined': 'General'
    },
    basePath: 'assets/styles/**/*.scss',
  }
};


// Sass tasks are divided for performance issues regarding dependencies
// Sass Build task definition, only ran once
gulp.task('sass:build', ['webfont', 'bowercopy'], function(){

  return gulp.src(config.folderAssets.styles + '/styles.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(config.postCSS.processors))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.folderDev.css))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Sass Watch task definition
gulp.task('sass', function(){
  
  return gulp.src(config.folderAssets.styles + '/styles.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(config.postCSS.processors))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.folderDev.css))
    .pipe(browserSync.reload({
      stream: true
    }));
});


// Browser Sync task definition
gulp.task('serve', ['build'], function() {
  return browserSync.init({
    server: {
      baseDir: config.folderDev.base
    },
  });
});
gulp.task('serve:sassdoc', function() {
  return browserSync.init({
    server: {
      baseDir: config.folderAssets.base + '/doc/'
    },
  });
});


// Process HTML task definition
gulp.task('processHtml', function () {
  return gulp.src(config.folderAssets.base + '/templates/*.html')
    .pipe(processHtml({
      recursive: true
    }))
    .pipe(gulp.dest(config.folderDev.base))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Generate webfonts
gulp.task('webfont:generate', function(){
  var fontName = 'icon-font';
  return gulp.src([config.folderAssets.base + '/icons/*.svg'])
    .pipe(iconfontCss({
      fontName: fontName,
      fontPath: '../fonts/',
      path: 'gulp-icontemplate.css',
      targetPath: '_icon-font.scss'
    }))
    .pipe(iconfont({
      fontName: fontName,
      formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'],
      normalize: true,
      fontHeight: 1001
     }))
    .pipe(gulp.dest(config.folderDev.fonts));
});
gulp.task('webfont:copy', ['webfont:generate'], function(){
  return gulp.src([config.folderDev.fonts + '/_icon-font.scss'])
  .pipe(gulp.dest(config.folderAssets.styles + '/libs/iconfont/'));
});
gulp.task('webfont', ['webfont:copy'], function(){
  return del([config.folderDev.fonts + '/*.scss']);
});


// Sassdoc generation Task definition
// doc task generates documentation and starts a live visualization of the docs in a browser
gulp.task('doc', ['serve:sassdoc'], function () {
  return gulp.src(config.folderAssets.base + '/**/*.scss')
    .pipe(sassdoc(config.sassDocOptions))
    .pipe(browserSync.reload({
      stream: true
    }));
});
// doc:generate only generates documentation. no server, no live display of genereated docs.
gulp.task('doc:generate', function () {
  return gulp.src(config.folderAssets.base + '/**/*.scss')
    .pipe(sassdoc(config.sassDocOptions));
});


// Kraken image optimization task definition
gulp.task('kraken', function () {
  gulp.src(config.folderAssets.base + '/images/*.*')
  .pipe(kraken({
      key: '',
      secret: '',
      lossy: true,
      concurrency: 6
  }))
  .pipe(gulp.dest(config.folderDev.base));
});

gulp.task('deploy', ['build'], function() {
  return gulp.src('dev/**')
    .pipe(sftp({
      host: '',
      port: 3000,
      user: '',
      pass: '',
      remotePath: ''
    }));
});

// Run bower update
gulp.task('bower', function() {
  return bower({ cmd: 'update'});
});

// Copy only the needed resources from Bower
gulp.task('bowercopy', ['bowercopy:jeet', 'bowercopy:normalize', 'bowercopy:sassy-cast', 'bowercopy:jquery']);

gulp.task('bowercopy:jeet', ['bower'], function () {
  return gulp.src([config.folderBower.jeet + '/scss/*.scss'])
  .pipe(gulp.dest(config.folderAssets.styles + '/libs/jeet'));
});
gulp.task('bowercopy:normalize', ['bower'], function () {
  return gulp.src([config.folderBower.normalize + '/*.scss'])
  .pipe(gulp.dest(config.folderAssets.styles + '/libs/normalize'));
});
gulp.task('bowercopy:sassy-cast', ['bower'], function () {
  return gulp.src([config.folderBower.sassyCast + '/dist/*.scss'])
  .pipe(gulp.dest(config.folderAssets.styles + '/libs/sassy-cast'));
});
gulp.task('bowercopy:jquery', ['bower'], function () {
  return gulp.src([config.folderBower.jquery + '/dist/jquery.min.js'])
  .pipe(gulp.dest(config.folderDev.base + '/js/vendor'));
});


// Copy tasks
gulp.task('copy:js', function() {
  return gulp.src([config.folderAssets.js + '/**/*.js'])
  .pipe(gulp.dest(config.folderDev.js));
});

gulp.task('copy:images', function() {
  return gulp.src([config.folderAssets.images + '/**/*'])
  .pipe(gulp.dest(config.folderDev.images));
});


// Delete dev folder for cleaning
gulp.task('clean', ['clean:fonts', 'clean:js', 'clean:libs', 'clean:bower']);

gulp.task('clean:js', function() {
  return del.sync(config.folderDev.js);
});
gulp.task('clean:fonts', function() {
  return del.sync([config.folderDev.fonts, config.folderAssets.styles + '/libs/iconfont']);
});
gulp.task('clean:libs', function() {
  return del.sync([config.folderAssets.styles + '/libs']);
});
gulp.task('clean:bower', function() {
  return del.sync([config.folderBower.base]);
});


// Watch for changes
gulp.task('run', ['clean', 'serve'], function (){
  gulp.watch(config.folderAssets.base + '/**/*.scss', ['sass']);
  gulp.watch(config.folderAssets.base + '/icons/*.svg', ['build']);
  gulp.watch(config.folderAssets.images + '/*.*', ['copy:images']);
  gulp.watch(config.folderAssets.js + '/*' , ['copy:js']);
  gulp.watch(config.folderAssets.base + '/templates/*.html', ['processHtml']);
  gulp.watch(config.folderDev.js + '/*' , browserSync.reload({ stream: true })); 
});

// Define build task
gulp.task('build', ['sass:build', 'processHtml', 'copy:images', 'copy:js']);

// Require Gulp
var gulp = require('gulp'),
  // Require Gulp-sass plugin
  sass = require('gulp-sass'),
  // Sass globbing import for LibSass
  globbing = require('gulp-css-globbing'),
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
  // Require postCSS clean
  cleanCSS = require('gulp-clean-css'),
  // Require Css-MQpacker// Clean CSS
  mqpacker = require('css-mqpacker'),
  // Image optimization plugin
  imagemin = require('gulp-imagemin'),
  // Image optimization using Kraken API
  kraken = require('gulp-kraken'),
  // Zip plugin
  zip = require('gulp-zip'),
  // Concat plugin
  concat = require('gulp-concat'),
  // uglify plugin
  uglify = require('gulp-uglify'),
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
  folderDist: {
    base: 'dist',
    css: 'dist/css',
    fonts: 'dist/fonts',
    images: 'dist/img',
    js: 'dist/js'
  },
  folderDoc: {
    base: 'documentation'
  },
  postCSS: {
    processors: [
      autoprefixer({
        browsers: [
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
        ]
      }),
      mqpacker()
    ]
  },
  // Sassdoc task options
  sassDocOptions: {
    dest: './documentation',
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
gulp.task('sass:build', ['webfont', 'bowercopy'], function() {
  return gulp.src(config.folderAssets.styles + '/styles.scss')
    .pipe(globbing({
      // Configure it to use SCSS files
      extensions: ['.scss']
    }))
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(config.postCSS.processors))
    .pipe(cleanCSS({ advanced: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.folderDev.css))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Sass Watch task definition
gulp.task('sass', function() {
  return gulp.src(config.folderAssets.styles + '/styles.scss')
    .pipe(globbing({
      // Configure it to use SCSS files
      extensions: ['.scss']
    }))
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(config.postCSS.processors))
    .pipe(cleanCSS({ advanced: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.folderDev.css))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// CSS copy to dist folder
gulp.task('copy:css', ['sass:build'], function() {
  return gulp.src(config.folderDev.css + '/*.*')
    .pipe(gulp.dest(config.folderDist.css));
});

// Browser Sync task definition
gulp.task('serve', ['build'], function() {
  return browserSync.init({
    port: 1337,
    server: {
      baseDir: config.folderDev.base
    },
    ui: {
      port: 1338
    }
  });
});

gulp.task('serve:sassdoc', function() {
  return browserSync.init({
    port: 1339,
    server: {
      baseDir: config.folderDoc.base
    },
    ui: {
      port: 1340
    }
  });
});

// Process HTML task definition
gulp.task('processHtml', function() {
  return gulp.src(config.folderAssets.base + '/templates/*.html')
    .pipe(processHtml({
      recursive: true,
      environment: 'dev'
    }))
    .pipe(gulp.dest(config.folderDev.base))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Process HTML task definition for distribution purposes
gulp.task('processHtml:dist', function() {
  return gulp.src(config.folderAssets.base + '/templates/*.html')
    .pipe(processHtml({
      recursive: true,
      environment: 'dist'
    }))
    .pipe(gulp.dest(config.folderDist.base));
});

// Generate webfonts
gulp.task('webfont', ['webfont:copy'], function() {
  return del([config.folderDev.fonts + '/*.scss']);
});

gulp.task('webfont:copy', ['webfont:generate'], function() {
  return gulp.src([config.folderDev.fonts + '/_icon-font.scss'])
    .pipe(gulp.dest(config.folderAssets.styles + '/libs/iconfont/'));
});

gulp.task('webfont:generate', function() {
  var fontName = 'icon-font';
  return gulp.src([config.folderAssets.base + '/icons/*.svg'])
    .pipe(iconfontCss({
      fontName: fontName,
      fontPath: '../fonts/',
      path: config.folderAssets.styles + '/libs/iconfont/gulp-icontemplate.css',
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

// Copy webfonts to Dist folder
gulp.task('copy:fonts', ['sass:build'], function() {
  return gulp.src(config.folderDev.fonts + '/*.*')
    .pipe(gulp.dest(config.folderDist.fonts));
});

// Sassdoc generation Task definition
// starts doc browserSync server and watches for changes
gulp.task('doc:watch', ['doc:serve'], function() {
  gulp.watch(config.folderAssets.base + '/**/*.scss', ['doc']);
});

gulp.task('doc:serve', ['serve:sassdoc'], function() {
  return gulp.src(config.folderAssets.base + '/**/*.scss')
    .pipe(sassdoc(config.sassDocOptions));
});

gulp.task('doc', function() {
  var docstream = sassdoc(config.sassDocOptions);
  docstream.promise.then(browserSync.reload);
  return gulp.src(config.folderAssets.base + '/**/*.scss')
    .pipe(docstream);
});

// Run bower update
gulp.task('bower', function() {
  return bower({
    cmd: 'update'
  });
});

// Copy only the needed resources from Bower
gulp.task('bowercopy', ['bowercopy:jeet', 'bowercopy:normalize', 'bowercopy:sassy-cast', 'bowercopy:jquery']);

gulp.task('bowercopy:jeet', ['bower'], function() {
  return gulp.src([config.folderBower.jeet + '/scss/*.scss'])
    .pipe(gulp.dest(config.folderAssets.styles + '/libs/jeet'));
});
gulp.task('bowercopy:normalize', ['bower'], function() {
  return gulp.src([config.folderBower.normalize + '/*.scss'])
    .pipe(gulp.dest(config.folderAssets.styles + '/libs/normalize'));
});
gulp.task('bowercopy:sassy-cast', ['bower'], function() {
  return gulp.src([config.folderBower.sassyCast + '/dist/*.scss'])
    .pipe(gulp.dest(config.folderAssets.styles + '/libs/sassy-cast'));
});
gulp.task('bowercopy:jquery', ['bower'], function() {
  return gulp.src([config.folderBower.jquery + '/dist/jquery.min.js'])
    .pipe(gulp.dest(config.folderDev.base + '/js/vendor'));
});

// Optimize JS
gulp.task('js:dist', function() {
  return gulp.src([config.folderAssets.js + '/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('app.js', {
      newLine: ';'
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.folderDist.js));
});

// Copy JS
gulp.task('copy:js', function() {
  return gulp.src([config.folderAssets.js + '/**/*.js'])
    .pipe(gulp.dest(config.folderDev.js));
});

// Optimize Images
gulp.task('images:dist', function() {
  return gulp.src([config.folderAssets.images + '/**/*'])
    .pipe(imagemin({
      optimizationLevel: 5,
      progressive: true,
      svgoPlugins: [{ removeViewBox: true }]
    }))
    .pipe(gulp.dest(config.folderDist.images));
});

// Kraken task (set up if needed)
gulp.task('kraken', function() {
  gulp.src([config.folderAssets.images + '/**/*'])
    .pipe(kraken({
      key: 'kraken-api-key-here',
      secret: 'kraken-api-secret-here',
      lossy: true,
      concurrency: 6
    }))
    .pipe(gulp.dest(config.folderDist.images));
});

// Copy Images
gulp.task('copy:images', function() {
  return gulp.src([config.folderAssets.images + '/**/*'])
    .pipe(gulp.dest(config.folderDist.images));
});

// Delete dev folder for cleaning
gulp.task('clean', ['clean:dev', 'clean:bower']);

gulp.task('clean:dev', function() {
  return del.sync(config.folderDev.base);
});
gulp.task('clean:bower', function() {
  return del.sync([config.folderBower.base]);
});

// Watch for changes
gulp.task('run', ['clean', 'serve'], function() {
  gulp.watch(config.folderAssets.base + '/**/*.scss', ['sass']);
  gulp.watch(config.folderAssets.base + '/icons/*.svg', ['webfont']);
  gulp.watch(config.folderAssets.images + '/*.*', ['copy:images']);
  gulp.watch(config.folderAssets.js + '/*', ['copy:js']);
  gulp.watch(config.folderAssets.base + '/templates/*.html', ['processHtml']);
  gulp.watch(config.folderDev.js + '/*.js').on('change', browserSync.reload);
});

// Define task to deploy to SFTP server
gulp.task('deploy', ['build'], function() {
  return gulp.src([config.folderDev.base + '/**/*.*', '!./dev/js/vendor/**'])
    .pipe(sftp({
      host: '',
      port: 3000,
      user: '',
      pass: '',
      remotePath: ''
    }));
});

// Define Dist generation and zipping
gulp.task('dist:zip', ['dist'], function() {
  var today = new Date();
  return gulp.src(config.folderDist.base)
    .pipe(zip('deploy--' +
      today.getFullYear() + '-' +
      (today.getMonth() + 1) + '-' +
      today.getDate() +
      '_' +
      today.getHours() + '-' +
      today.getMinutes() + '-' +
      today.getSeconds() +
    '.zip'))
    .pipe(gulp.dest('./'));
});

// Define Dist generation task
gulp.task('dist', ['copy:css', 'copy:fonts', 'js:dist', 'processHtml:dist', 'images:dist']);

// Define build task
gulp.task('build', ['sass:build', 'copy:js', 'processHtml', 'copy:images', 'doc']);

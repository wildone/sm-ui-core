// Core deps
import gulp from 'gulp';
import notify from 'gulp-notify';
import gulpif from 'gulp-if';
import size from 'gulp-size';
import rename from 'gulp-rename';
import plumber from 'gulp-plumber';
import gulprun from 'run-sequence';
import yargs from 'yargs';
import browserSync from 'browser-sync';

// HTML
import inline from 'gulp-inline-source';
import processInline from 'gulp-process-inline';
import minify from 'gulp-htmlmin';

// CSS
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';

const bs = browserSync.create(),
      argv = yargs.boolean(['debug']).argv,
      errorNotifier = () => plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }),
      OPTIONS = {
        postcss: [
          autoprefixer()
        ],
        inline: {
          compress: false,
          swallowErrors: true
        },
        HTMLmin: {
          removeComments: true,
          removeCommentsFromCDATA: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          caseSensitive: true,
          keepClosingSlash: true,
          customAttrAssign: [/\$=/],
          minifyCSS: true
        },
        browserSync: {
          server: {
            baseDir: './',
            index: 'demo/index.html',
            routes: {
              '/': './bower_components'
            }
          },
          open: false,
          notify: false
        }
      };

gulp.task('build', () => {
  return gulp.src('src/**/*.html')
          .pipe(errorNotifier())

            // Inline sources
            .pipe(inline(OPTIONS.inline))

            // CSS
            .pipe(processInline().extract('style'))
              .pipe(postcss(OPTIONS.postcss))
            .pipe(processInline().restore())

            // Minify and pipe out
            .pipe(gulpif(!argv.debug, minify(OPTIONS.HTMLmin)))
            .pipe(rename({dirname: ''}))
            .pipe(size({ gzip: true }))
          .pipe(gulp.dest('.'));
});

gulp.task('demo', (callback) => bs.init(OPTIONS.browserSync));

gulp.task('refresh', () => bs.reload());

gulp.task('watch', () => gulp.watch(['src/**/*'], () => gulprun('build', 'refresh')));

gulp.task('default', ['build', 'demo', 'watch']);

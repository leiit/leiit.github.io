var gulp = require("gulp");
var sass = require("gulp-sass");
var prefix = require("gulp-autoprefixer");

gulp.task("sass", function (done) {
  gulp
    .src(["./src/styles/main.scss"])
    .pipe(sass())
    .pipe(prefix({ browsers: ["last 2 versions"] }))
    .pipe(gulp.dest("./public/styles"));
  done();
});

gulp.task("watch", function () {
  gulp.watch("./src/styles/**/*.scss", gulp.series("sass"));
});

gulp.task("default", gulp.series(["sass", "watch"]));

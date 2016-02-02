var gulp = require('gulp');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');

gulp.task('sass', function (){
	gulp.src(['./src/styles/main.sass'])
		.pipe(sass())
		.pipe(prefix({ browsers: ['last 2 versions'] }))
		.pipe(gulp.dest('./public/styles'));
});

gulp.task('watch', function(){
	gulp.watch("./src/styles/**/*.sass", function(){
		gulp.run('sass');
	});
});

gulp.task('default', function() {
	gulp.run(['sass', 'watch']);
});

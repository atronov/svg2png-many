import gulp from "gulp";
import babel from "gulp-babel";
import jasmine from "gulp-jasmine";
import eslint from "gulp-eslint";
import del from "del";

gulp.task('clean', () => del(['lib/']));

gulp.task('build', ['clean'], () => {
    return gulp.src('src/**.js')
        .pipe(babel())
        .pipe(gulp.dest('lib'));
});

gulp.task('watch', ['build'], () => {
    gulp.watch('src/**/*.js', ['build']);
});

gulp.task('default', ['build']);
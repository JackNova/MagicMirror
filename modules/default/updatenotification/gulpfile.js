const pkg = require("./package.json"),
    gulp = require("gulp"),
    sass = require("gulp-sass"),
    sassVars = require("gulp-sass-vars"),
    browserify = require("browserify"),
    source = require("vinyl-source-stream"),
    rename = require("gulp-rename");

gulp.task("scripts", () => {
    return browserify(`src/index.js`)
        .bundle()
        .pipe(source(`${pkg.name}.js`))
        .pipe(gulp.dest("./"));
});

gulp.task("watch:scripts", () => {
    gulp.watch(["src/**/*.js"], ["scripts"]).on("error", function(err) {
        console.error("Error!", err.message);
    });
});

gulp.task("scss", () => {
    const variables = {
        name: pkg.name
    };

    gulp
        .src("src/style.scss")
        .pipe(sassVars(variables, { verbose: false }))
        .pipe(
            sass({ outputStyle: "compressed" }).on("error", err => {
                console.error(err.message);
            })
        )
        .pipe(rename(`${pkg.name}.css`))
        .pipe(gulp.dest("./"));
});

gulp.task("watch:scss", () => {
    gulp.watch("src/**/*.{scss,css}", ["scss"]);
});

gulp.task("default", ["scripts", "scss", "watch:scripts"]);
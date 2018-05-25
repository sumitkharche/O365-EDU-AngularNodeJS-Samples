/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/

var gulp = require('gulp'),
    ts = require('gulp-typescript');

var tsProject = ts.createProject('tsconfig.json');

gulp.task('build', () => {
    return gulp.src(['**/*.ts', '!app{,/**}', '!dist{,/**}', '!node_modules{,/**}'])
        .pipe(tsProject())
        .pipe(gulp.dest('./'));
});
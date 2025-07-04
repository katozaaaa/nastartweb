const browserSync = require('browser-sync').create();

browserSync.init({
    server: './src',
    files: ['**/*.html', '**/*.css', '**/*.js'],
});

const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */
mix.sass('app/frontend/scss/global.scss', 'public/css/global.css');

mix.js('app/frontend/index.js', 'public/js/index.js').vue();
mix.js('app/frontend/timeline.js', 'public/js/timeline.js').vue();

// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path')
var env = process.env.NODE_ENV

module.exports = {
  dev: {
    env: '"dev"',
    port: 8830,
    autoOpenBrowser: false,
    assetsSubDirectory: '',
    assetsPublicPath: '/',
    proxyTable: {
      '/api': {
        target: 'http://10.204.97.49:8080'
      }
    },
    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false
  }
}
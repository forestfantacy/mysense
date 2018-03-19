var path = require('path')
var isProduction = (process.env.NODE_ENV == "production" || process.env.NODE_ENV == "test");
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var HtmlWebpackPlugin = require('html-webpack-plugin')
var config = require('./config');
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
var config = require('./config')

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      'ace': path.resolve(__dirname, './webpackShims/ace'),
      'aceroot': path.resolve(__dirname, './webpackShims/aceroot'),
      'acequire': path.resolve(__dirname, './webpackShims/acequire')
    }
  },
  module: {
    rules: [{
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader'
        }],
      },
      {
        test: /\.(png|jpe?g|gif)(\?.*)?$/,
        use: 'url-loader?limit=8192&name=images/[name].[hash:7].[ext]'
      },
      {
        test: /\.less$/,
        loader: 'style-loader!css-loader!less-loader'
      }
    ]
  }
}
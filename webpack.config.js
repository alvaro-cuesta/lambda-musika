"use strict";
const webpack = require('webpack');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const PRODUCTION = process.env.NODE_ENV === 'production';
const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || "8888";

const SRC_DIR = path.join(__dirname, 'src');
const LIB_DIR = path.join(__dirname, 'lib');
const BUILD_DIR = path.join(__dirname, 'build');

/**/

var entry = {
  'lambda-musika': [],
};

if (!PRODUCTION) {
  entry['lambda-musika'].push(
    `webpack-dev-server/client?http://${HOST}:${PORT}`,
    'webpack/hot/only-dev-server'
  );
}

entry['lambda-musika'].push('./index.jsx');

/**/

var devServer = !PRODUCTION
  ? {
    host: HOST,
    port: PORT,
    contentBase: BUILD_DIR,
    noInfo: true,
    hot: true,
  }
  : undefined
  ;

/**/

var devtool = process.env.WEBPACK_DEVTOOL || (PRODUCTION ? 'source-map' : 'eval-source-map');

/**/

var plugins = [];

if (!PRODUCTION) {
  plugins.push(
    new webpack.NoErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin()
  );
}

plugins.push(
  new HtmlWebpackPlugin({template: 'index.ejs'}),
  new CopyWebpackPlugin([{from: './index.css'},])
);

if (PRODUCTION) {
  plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      mangle: true,
      sourceMap: true,
      output: {
        comments: false
      },
      compress: {
        warnings: false,
      }
    }),
    new CleanWebpackPlugin([BUILD_DIR], { root: process.cwd() })
  );
}

/**/

module.exports = {
  context: SRC_DIR,
  entry,
  output: {
    path: BUILD_DIR,
    filename: '[name].[chunkhash].js',
    chunkFilename: '[chunkhash].js'
  },
  resolve: {
    root: SRC_DIR,
    alias: {
      Musika: LIB_DIR,
    },
    extensions: ['', '.js', '.jsx', '.css'],
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, exclude: /node_modules/, loaders: ['babel'] },
      { test: /\.css$/, loaders: ['style', 'css'] },
    ]
  },
  devServer,
  devtool,
  plugins
};

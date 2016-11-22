"use strict";
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const validate = require('webpack-validator');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const parts = require('./webpack.parts.js');

const PRODUCTION = process.env.NODE_ENV === 'production';
const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || "8888";

const PATHS = {
  app: path.join(__dirname, 'src'),
  lib: path.join(__dirname, 'lib'),
  build: path.join(__dirname, 'build'),
  examples: path.join(__dirname, 'examples'),
};

var devtool = process.env.WEBPACK_DEVTOOL || (PRODUCTION ? 'source-map' : 'eval-source-map');

const common = merge(
  parts.dontEmitIfErrors(),
  parts.basic(PATHS),
  {
    entry: {
      'lambda-musika': [ './index.jsx' ]
    },
    resolve: {
      alias: {
        examples: PATHS.examples,
      },
    },
    devtool,
    plugins: [
      new HtmlWebpackPlugin({template: 'index.ejs'}),
      new CopyWebpackPlugin([{from: './index.css'},])
    ]
  },
  parts.babelJSX(),
  parts.CSS()
);

let config;

switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(
      common,
      parts.productionEnv(),
      parts.clean(PATHS.build),
      parts.minify()
    );
    break;
  case 'dev':
    config = merge(
      parts.devServer({
        host: HOST,
        port: PORT
      }),
      parts.hotOnly({
        entry: 'lambda-musika',
        host: HOST,
        port: PORT
      }),
      common
    );
    break;
  default:
    config = common;
}

module.exports = validate(config);

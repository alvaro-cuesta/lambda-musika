"use strict";
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const validate = require('webpack-validator');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const parts = require('./webpack.parts.js');

const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || "8888";

const PATHS = {
  app: path.join(__dirname, 'src'),
  lib: path.join(__dirname, 'lib'),
  build: path.join(__dirname, 'build'),
  examples: path.join(__dirname, 'examples'),
};

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
    plugins: [
      new HtmlWebpackPlugin({template: 'index.ejs'}),
    ]
  },
  parts.babelJSX()
);

let config;

switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(
      common,
      parts.productionSourceMap(),
      parts.productionEnv(),
      parts.extractCSS(),
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
      common,
      parts.devSourceMap(),
      parts.CSS()
    );
    break;

  default:
    config = merge(
      common,
      parts.devSourceMap(),
      parts.CSS()
    );
}

module.exports = validate(config);

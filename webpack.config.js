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
  app: path.join(__dirname, 'app'),
  lib: path.join(__dirname, 'lib'),
  build: path.join(__dirname, 'build'),
  examples: path.join(__dirname, 'examples'),
};

const COMMON = merge(
  parts.dontEmitIfErrors(),
  parts.basic(PATHS),
  {
    entry: { 'lambda-musika': [ './index.jsx' ] },
    resolve: {
      alias: {
        examples: PATHS.examples,
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'index.ejs',
        chunksSortMode: 'dependency',
        minify: { collapseWhitespace: true }
      }),
    ]
  },
  parts.babelJSX()
);

let config;

switch(process.env.npm_lifecycle_event) {
  case 'deploy:gh-pages':
  case 'build:gh-pages':
    process.env.BABEL_ENV = 'production'
    config = merge(
      COMMON,
      {output: {publicPath: '/'}},
      parts.productionSourceMap(),
      parts.productionEnv(),
      parts.extractVendor([
        'brace/mode/javascript',
        'brace/theme/tomorrow_night_eighties',
        'brace/ext/error_marker',
        'brace/ext/searchbox',
        'brace/ext/elastic_tabstops_lite',
        'brace/ext/keybinding_menu',
        'brace/ext/settings_menu'
      ]),
      parts.extractStyles({css: false, stylus: true}),
      parts.clean(PATHS.build),
      parts.minify()
    );
    break;

  case 'build':
    process.env.BABEL_ENV = 'production'
    config = merge(
      COMMON,
      parts.productionSourceMap(),
      parts.productionEnv(),
      parts.extractVendor([
        'brace/mode/javascript',
        'brace/theme/tomorrow_night_eighties',
        'brace/ext/error_marker',
        'brace/ext/searchbox',
        'brace/ext/elastic_tabstops_lite',
        'brace/ext/keybinding_menu',
        'brace/ext/settings_menu'
      ]),
      parts.extractStyles({css: false, stylus: true}),
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
      COMMON,
      parts.devSourceMap(),
      parts.stylus()
    );
    break;

  default:
    config = merge(
      COMMON,
      parts.devSourceMap(),
      parts.stylus()
    );
}

module.exports = validate(config);

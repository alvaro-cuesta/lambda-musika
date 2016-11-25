const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

exports.basic = function(paths) {
  return {
    context: paths.app,
    output: {
      path: paths.build,
      filename: '[name].[hash].js',
      chunkFilename: '[chunkhash].js'
    },
    resolve: {
      root: [paths.app, paths.lib],
      extensions: [''],
    },
    devtool: process.env.WEBPACK_DEVTOOL
  };
};

exports.devServer = function(options) {
  return {
    devServer: {
      hot: true,
      inline: true,
      noInfo: true,
      host: options.host,
      port: options.port
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin({
        multiStep: true
      })
    ]
  };
};

exports.hotOnly = function(options) {
  const points = [
    `webpack-dev-server/client?http://${options.host || 'localhost'}:${options.port || 8080}`,
    'webpack/hot/only-dev-server'
  ];

  let entry;
  if (options.entry) {
    entry = {};
    entry[options.entry] = points;
  } else {
    entry = points;
  }

  return {
    entry,
    devServer: { inline: false }
  };
};

exports.clean = function(path) {
  return {
    plugins: [
      new CleanWebpackPlugin([path], {
        root: process.cwd()
      })
    ]
  };
};

const MINIFY_CONFIG = {
  minimize: true,
  screw_ie8 : true,
  mangle: {
    except: ['webpackJsonp'],
    screw_ie8 : true,
    keep_fnames: false,
  },
  output: {
    comments: false,
    screw_ie8 : true
  },
  compress: {
    sequences: true,
    properties: true,
    dead_code: true,
    drop_debugger: true,
    unsafe: false,
    unsafe_comps: false,
    conditionals: true,
    comparisons: true,
    evaluate: true,
    booleans: true,
    loops: true,
    unused: true,
    hoist_funs: true,
    hoist_vars: false,
    if_return: true,
    join_vars: true,
    cascade: true,
    collapse_vars: true,
    reduce_vars: true,
    warnings: false,
    negate_iife: true,
    pure_getters: true,
    pure_funcs: null,
    drop_console: false,
    keep_fargs: false,
    keep_fnames: false,
    screw_ie8 : true
  }
};

exports.minify = function() {
  return {
    plugins: [
      new webpack.optimize.UglifyJsPlugin(Object.assign(
        {},
        MINIFY_CONFIG,
        {
          exclude: [/vendor/, /manifest/],
          sourceMap: true,
        }
      )),
      new webpack.optimize.UglifyJsPlugin(Object.assign(
        {},
        MINIFY_CONFIG,
        {
          test: [/vendor/, /manifest/],
          sourceMap: false,
        }
      )),
      new webpack.optimize.OccurrenceOrderPlugin(false),
      new webpack.optimize.DedupePlugin()
    ]
  };
};

exports.dontEmitIfErrors = function() {
  return {
    plugins: [
      new webpack.NoErrorsPlugin()
    ]
  };
};

exports.productionEnv = function() {
  return {
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"'
        }
      })
    ]
  };
};

exports.babelJSX = function() {
  return {
    resolve: { extensions: ['.js', '.jsx'] },
    module: {
      loaders: [
        { test: /\.jsx?$/, exclude: /node_modules/, loaders: ['babel?cacheDirectory'] }
      ]
    }
  };
};

exports.CSS = function() {
  return {
    resolve: { extensions: ['.css'] },
    module: {
      loaders: [
        { test: /\.css$/, loaders: ['style', 'css?sourceMap'] },
      ]
    }
  };
};

exports.extractCSS = function() {
  let appCSS = new ExtractTextPlugin('[name].[chunkhash].css');
  let vendorCSS = new ExtractTextPlugin('[name]-vendor.[chunkhash].css');

  return {
    resolve: { extensions: ['.css'] },
    module: {
      loaders: [
        {
          test: /\.css$/,
          loader: appCSS.extract('style', 'css?sourceMap'),
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          loader: vendorCSS.extract('style', 'css'),
          include: /node_modules/
        }
      ]
    },
    plugins: [appCSS, vendorCSS]
  };
}

exports.productionSourceMap = function() {
  return {
    plugins: [
      new webpack.SourceMapDevToolPlugin({
        exclude: [/vendor/, /manifest/],
        filename: '[file].map',
        moduleFilenameTemplate: 'webpack:///[resource-path]',
        fallbackModuleFilenameTemplate: 'webpack:///[resourcePath]?[hash]',
        columns: true
      })
    ]
  }
}

exports.devSourceMap = function() {
  return { devtool: 'eval-source-map' };
}

exports.extractBundle = function(options) {
  const entry = {};
  entry[options.name] = options.entries;

  return {
    entry: entry,
    output: {filename: '[name].[chunkhash].js'},
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        names: [options.name, 'manifest']
      })
    ]
  };
}

exports.extractVendor = function(additionalVendorModules) {
  additionalVendorModules = additionalVendorModules || []

  return exports.extractBundle({
    name: 'vendor',
    entries: Object.keys(require('./package.json').dependencies).concat(additionalVendorModules)
  });
}

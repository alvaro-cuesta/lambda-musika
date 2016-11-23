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

exports.minify = function() {
  return {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        minimize: true,
        mangle: {
          except: ['webpackJsonp'],
          screw_ie8 : true
        },
        sourceMap: true,
        output: {
          comments: false
        },
        compress: {
          warnings: false,
          drop_console: true,
          screw_ie8 : true,
          keep_fnames: false
        }
      })
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

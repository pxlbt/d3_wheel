'use strict';

var path = require('path');
var webpack = require('webpack');
var production = process.env.TARGET === 'production';

var config = {
  entry:  __dirname + '/assets/javascripts/app.js',
  output: {
    path: path.join(__dirname, 'public/js'),
    filename: 'main.js'
  },

  module: {
    loaders: [
      { test: /.js$/, loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015']
        },
        exclude: /(node_modules|bower_components)/
      }
    ]
  },

  resolve: {
    root: path.join(__dirname, 'assets', 'javascripts'),
    extensions: ['', '.js', '.coffee', '.js.coffee', '.jsx.coffee','.js.jsx.coffee'],
    modulesDirectories: ["node_modules", "javascripts"]
  },

  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
      "React": 'react',
      "_": 'underscore'
    })
  ]
};

if (production) {
  config.plugins.push(
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compressor: { warnings: false },
      sourceMap: false
    }),
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify('production') }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin()
  );
} else {
  config.output.publicPath = './dist';
  config.devtool = 'cheap-module-eval-source-map';
}

module.exports = config;

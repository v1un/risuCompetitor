const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

// Base configuration for all targets
const baseConfig = {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
  ],
};

// Main process configuration
const mainConfig = merge(common, baseConfig, {
  target: 'electron-main',
  entry: {
    main: './src/main/index.ts',
  },
  node: {
    __dirname: false,
    __filename: false
  },
  externals: {
    'electron-squirrel-startup': 'commonjs electron-squirrel-startup',
  },
});

// Preload script configuration
const preloadConfig = merge(common, baseConfig, {
  target: 'electron-preload',
  entry: {
    preload: './src/preload/index.ts',
  },
  node: {
    __dirname: false,
    __filename: false
  },
});

// Renderer process configuration
const rendererConfig = merge(common, baseConfig, {
  target: 'web',
  entry: {
    renderer: './src/renderer/index.tsx',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/renderer/index.html'),
      filename: 'renderer/index.html',
      chunks: ['renderer'],
    }),
  ],
});

// Export an array of configurations
module.exports = [mainConfig, preloadConfig, rendererConfig];
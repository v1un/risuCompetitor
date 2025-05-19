const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = merge(common, {
  mode: 'production',
  entry: {
    main: './src/main/index.ts',
    renderer: './src/renderer/index.tsx',
    preload: './src/preload/index.ts',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/renderer/index.html'),
      filename: 'renderer/index.html',
      chunks: ['renderer'],
      minify: {
        removeAttributeQuotes: true,
        collapseWhitespace: true,
        removeComments: true,
      },
    }),
    // Provide polyfills for Node.js core modules
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
    // Define global variables
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.type': JSON.stringify(process.type),
      'process.version': JSON.stringify(process.version),
    }),
  ],
  // Configure node integration
  target: 'electron-renderer',
  node: {
    __dirname: false,
    __filename: false,
  },
});
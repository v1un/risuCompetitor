const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
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
    }),
  ],
});
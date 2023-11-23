const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './public/index.js',
    mode: 'development',
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Tetris Website Placeholder Title',
      }),
    ],
    output: {
      path: path.resolve(__dirname, 'dist/'),
      filename: 'bundle.js',
      clean: true
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
      ]
    }
  };
  
const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: './public/index_tetrisClient.js',
    mode: 'development',
    output: {
      path: path.resolve(__dirname, 'dist/'),
      filename: 'bundle_tetrisClient.js',
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
  
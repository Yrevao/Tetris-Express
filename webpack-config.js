const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './public/index_tetrisClient.tsx',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist/webpack'),
    filename: 'bundle_tetrisClient.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-typescript", "@babel/preset-react"]
          }
        }
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ]
  }
};

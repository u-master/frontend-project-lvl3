const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const runMode = process.env.NODE_ENV || 'production';

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  watch: (runMode === 'development'),
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'RSS Reader',
      template: './src/static/index.html',
    }),
  ],
};

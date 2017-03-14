const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractSass = new ExtractTextPlugin({
    filename: 'style.css',
    allChunks: true
});

module.exports = {
  entry: [
  	// 'babel-polyfill',
  	'./src/index.js',
  	'./src/css/style.scss'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'grease.js'
  },
  devtool: "source-map",
  module: {
  	rules: [{
      test: /\.scss$/,
      loader: extractSass.extract({
        use: [{
          loader: "css-loader"
        }, {
          loader: 'sass-loader'
        }],
        // use style-loader in development
        fallback: "style-loader"
      })
    }]
  },
  plugins: [
  	extractSass,
    new HtmlWebpackPlugin({
      title: 'Grease Demo',
      template: 'src/index.html',
      filename: 'index.html',
      inject: true
    })
  ]
};
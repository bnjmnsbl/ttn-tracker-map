const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CopyPlugin([
      { from: 'src/index.html', to: 'index.html' },
      { from: 'src/images', to: 'images' },
    ]),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|gif|ico)$/i,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          emitFile: true,
        },
      },
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
  },
};

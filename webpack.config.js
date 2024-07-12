const path = require('path');

module.exports = {
  entry: {
    index: '/views/index.tsx',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public/bundle'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.tsx'],
  },
  devServer: {
    contentBase: path.join(__dirname, 'public/bundle'),
    compress: true,
    port: 5000,
  },
  watch: true, 
};

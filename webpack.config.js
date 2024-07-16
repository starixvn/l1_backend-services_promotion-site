const path = require('path');

module.exports = {
  mode: 'development', 
  entry: {
    index: '/views/index.tsx',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public/bundle'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
            cacheDirectory: false
          },
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
    extensions: ['.ts','.tsx','.js', '.jsx'],
  },
  devServer: {
    contentBase: path.join(__dirname, 'public/bundle'),
    compress: true,
    port: 5000,
  },
  watch: false, 
  cache: false, 
  devtool: 'source-map'
};

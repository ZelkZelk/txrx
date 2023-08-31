const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); 
const dotenv = require('dotenv');
const webpack = require('webpack');
const env = dotenv.config().parsed;
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

module.exports = {
  entry: {
    playground: './playground/index.tsx',
    backoffice: './backoffice/index.tsx'
  },
  resolve: {
    fallback: {
        crypto: false,
        os: false,
        path: false,
        fs: false,
    },
    extensions: ['.ts', '.tsx', '.js', '.css'],
    modules: [
      'node_modules'
    ]        
  },
  optimization: {
     minimize: process.env.NODE_ENV == 'production'
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, 'assets'),
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },   
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {}
          }
        ]
      },
    ],
  },
  devServer: {
    static: {
        directory: path.join(__dirname, 'dist'),
    },
    historyApiFallback: {
      rewrites: [
        { from: /^\/backoffice\/(.*)$/, to: '/backoffice' },
      ],
    },
    host: '0.0.0.0',
    port: 3000,
    compress: true,
    hot: true,
    static: './',
    devMiddleware: {
        publicPath: '/',
    }
  },
  devtool: 'source-map',
  output: {
    filename: '[name]/bundle.js',
    publicPath: '/',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
        title: 'Playground',
        template: './playground/index.html',
        filename: './playground/index.html',
        inject: false
    }),
    new HtmlWebpackPlugin({
        title: 'Backoffice',
        template: './backoffice/index.html',
        filename: './backoffice/index.html',
        inject: false
    }),
    new webpack.DefinePlugin(envKeys),
  ],
};
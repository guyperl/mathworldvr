const path = require('path')
const webpack = require('webpack')
const WebpackMd5Hash = require('webpack-md5-hash')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

const ip = process.env.IP || '0.0.0.0'
const port = process.env.PORT || 3000
const DEBUG = process.env.NODE_ENV !== 'production'
const PUBLIC_PATH = `/${process.env.PUBLIC_PATH || ''}/`.replace('//', '/')

const isVendor = ({ userRequest }) => (
  userRequest &&
  userRequest.indexOf('node_modules') >= 0 &&
  userRequest.match(/\.js$/)
)

const config = {
  mode: DEBUG ? 'production' : 'development',
  devtool: DEBUG ? 'source-map' : false,
  entry: {
    app: ['@babel/polyfill', path.join(__dirname, 'src')],
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].[hash].js',
    publicPath: PUBLIC_PATH,
  },
  resolve: {
    modules: ['src', 'node_modules'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.PUBLIC_PATH': JSON.stringify(PUBLIC_PATH),
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(__dirname, '/public/index.html'),
    }),
  ],
  module: {
    rules: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.png$/, loader: 'url-loader?prefix=images/&limit=8000&mimetype=image/png' },
      { test: /\.jpg$/, loader: 'url-loader?prefix=images/&limit=8000&mimetype=image/jpeg' },
      { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?prefix=fonts/&limit=8000&mimetype=application/font-woff' },
      { test: /\.ttf$/, loader: 'file-loader?prefix=fonts/' },
      { test: /\.eot$/, loader: 'file-loader?prefix=fonts/' },
      { test: /\.css$/, loader: 'css-loader' },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
    ],
  },
}

if (DEBUG) {
  config.entry.app.unshift(
    `webpack-dev-server/client?http://${ip}:${port}/`,
    'webpack/hot/only-dev-server',
    'react-hot-loader/patch'
  )

  config.plugins = config.plugins.concat([
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ])
} else {
  config.output.filename = '[name].[chunkHash].js'
  config.plugins = config.plugins.concat([
    new WebpackMd5Hash(),
    new UglifyJSPlugin(),
  ])
}

module.exports = config

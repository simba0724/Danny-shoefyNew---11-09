const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolveAppPath = relativePath => path.resolve(appDirectory, relativePath);

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: resolveAppPath('src'),
  output: {
    filename: process.env.production ? '[name].[chunkhash].js' : '[name].[hash].js',
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  performance: {
    hints: false,
    maxEntrypointSize: 4096000,
    maxAssetSize: 4096000
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        include: resolveAppPath('src'),
        loader: 'babel-loader',
        options: {
          presets: [
            require.resolve('babel-preset-react-app')
          ]
        }
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.html$/i,
        use: ["raw-loader"]
      },
      {
        test: /\.(png|jpg|gif|swf)$/,
        use: 'file-loader'
      },
      {
        test: /\.(ttf|eot|svg|woff(2)?)(\S+)?$/,
        use: 'file-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: resolveAppPath('public/index.html'),
    }),
    new CopyPlugin({
      patterns: [
        { from: ".htaccess", to: "" },
        { from: "public/images", to: "images" },
        { from: "public/sitemap.xml", to: "" },
        { from: "public/robots.txt", to: "" },
        { from: "public/locales", to: "locales" }
      ],
    }),
  ],
}
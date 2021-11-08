const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolveAppPath = relativePath => path.resolve(appDirectory, relativePath);

const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

// Host
const host = process.env.HOST || 'localhost';

// Required for babel-preset-react-app
process.env.NODE_ENV = 'development';

module.exports = merge(common, {
	mode: 'development',
	devtool: 'inline-source-map',
	devServer: {

		// Serve index.html as the base
		contentBase: resolveAppPath('public'),

		// Enable compression
		compress: true,

		// Enable hot reloading
		hot: true,

		host,

		port: 3000,

		// Public path is root of content base
		publicPath: '/',
		historyApiFallback: true

	}
});

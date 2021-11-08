const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

// Required for babel-preset-react-app
process.env.NODE_ENV = 'production';

module.exports = merge(common, {
	mode: 'production',
});

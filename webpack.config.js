const path = require('path');

module.exports = {
    entry: {
        app: './src/index.js'
    },
    mode: 'production',
    module: {
        rules: [{
            test: /\.(js)$/,
            include: path.resolve(__dirname, 'src'),
            exclude: /node_modules/,
            //loader: 'babel-loader'
        }]
    },
    output: {
        filename: 'index.min.js',
        path: path.resolve(__dirname, 'dist')
    },
    optimization: {
        chunkIds: 'total-size',
		concatenateModules: true,
		emitOnErrors: true,
		mangleExports: 'size',
		minimize: true,
		usedExports: true
    },
};
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './src/app.ts',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        modules: [
            path.resolve('./src'),
            path.resolve('./node_modules'),
        ],
    },
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devtool: 'inline-source-map',
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Development',
            template: path.resolve(__dirname, './src/index.html'),
            filename: 'index.html',
        }),
        new CleanWebpackPlugin(),
    ],
    devServer: {
        historyApiFallback: true,
        contentBase: path.resolve(__dirname, './static'),
        open: false,
        compress: true,
        hot: true,
        port: 8080,
    },
};
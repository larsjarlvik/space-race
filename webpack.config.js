const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => ({
    entry: './src/app.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }, {
                test: /\.svg$/,
                loader: 'svg-inline-loader'
            }
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
        filename: 'app.[fullhash].js',
        path: path.resolve(__dirname, 'dist'),
    },
    devtool: 'source-map',
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './src/index.html'),
            filename: 'index.html',
        }),
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                { from: 'static', to: '.' },
            ]
        }),
        new webpack.DefinePlugin({
            'process.env': { NODE_ENV: JSON.stringify(argv.mode) }
        })
    ],
    devServer: {
        historyApiFallback: true,
        contentBase: path.resolve(__dirname, './static'),
        open: false,
        compress: true,
        hot: true,
        port: 8080,
        host: '0.0.0.0',
    },
    performance: {
        hints: false,
        maxEntrypointSize: 1024 * 1024,
        maxAssetSize: 1024 * 512,
    },
});
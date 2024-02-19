const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: 'development',
    entry: {
        main: './src/main.ts',
    },
    cache: {
        type: 'filesystem',
    },

    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'bundle.js',
        publicPath: '/',
    },
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'public'),
        },
        client: {
            logging: 'info',
        },

        devMiddleware: {
            writeToDisk: true,
        },
    },
    devtool: 'cheap-module-source-map',
    plugins: [
        // new HtmlWebpackPlugin({
        //     title: 'Development',
        //     inject: 'body',
        //     template: "src/index.html",
        // }),
        new CopyPlugin({
            patterns: [
                { from: path.join(__dirname, 'src/vendors'), to: path.join(__dirname, "public/vendors"), force: true },
                { from: path.join(__dirname, 'src/index.html'), to: path.join(__dirname, "public/index.html"), force: true }
            ],
        })
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                }
            },
            {
                test: /\.tpl.html$/,
                exclude: /node_modules/,
                use: {loader: 'html-loader'}
            }
        ],
    },
    resolve: { 
        extensions: ['.tsx', '.ts', '.js'],
    },

};

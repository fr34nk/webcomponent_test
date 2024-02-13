const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");


module.exports = {
    mode: 'development',
    entry: {
        main: './src/main.js',
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
        allowedHosts: 'auto',
        client: {
            logging: 'info',
        },
        hot: true, 
    },
    devtool: 'inline-source-map',
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Development',
            inject: 'body',
            template: "src/index.html",
        }),
        new CopyPlugin({
            patterns: [
                { from: path.join(__dirname, 'src/vendors'), to: path.join(__dirname, "public/vendors"), force: true }
            ],
        })
    ],
    module: {
        rules: [
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
};

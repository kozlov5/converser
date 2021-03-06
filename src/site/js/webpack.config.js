const { resolve } = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const isProd = process.env.NODE_ENV == 'production';

const config = {
    entry: [
        './index.js'
        // the entry point of our app
    ],
    output: {
        filename: 'bundle.js',
        // the output bundle

        path: resolve(__dirname, '../build'),

        publicPath: '/build/'
        // necessary for HMR to know where to load the hot update chunks
    },

    context: resolve(__dirname),

    devtool: isProd ? 'cheap-source-map' : 'inline-source-map',

    devServer: isProd ? undefined : {
        contentBase: resolve(__dirname, '../static'),
        // match the output path

        publicPath: '/build/'
        // match the output `publicPath`
    },

    module: {
        loaders: [
            { test: /\.js$/,
                loaders: [
                    'babel-loader',
                ],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                loaders: [
                    'style-loader',
                    'css-loader?modules',
                    'postcss-loader',
                ],
            },
        ],
    },

    plugins: isProd ? [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production'),
                'API_HOST': JSON.stringify( process.env.API_HOST ),
                'CALL': JSON.stringify( process.env.CALL ),
                'STRIPE_P_KEY': JSON.stringify( process.env.STRIPE_P_KEY )
            }
        }),
        new webpack.NamedModulesPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
    ] : [
        new webpack.DefinePlugin({
            'process.env': {
                'STRIPE_P_KEY': JSON.stringify( process.env.STRIPE_P_KEY ),
                'API_HOST': JSON.stringify( process.env.API_HOST ),
                'CALL': JSON.stringify( process.env.CALL ),
                'NODE_ENV': JSON.stringify( 'development' )
            }
        }),
        ],
};

module.exports = config;
//Dependencies
const path = require('path')
const webpack = require('webpack')
const {
    optimize,
    NamedModulesPlugin
} = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const cleanWebpackPlugin = require('clean-webpack-plugin')

const { ImageminWebpackPlugin } = require('imagemin-webpack')
const imageminGifsicle = require('imagemin-gifsicle')

const imageminManifest = {}

const isprod = process.env.NODE_ENV === 'production'
const getDevtool = () => {
    let devtool
    isprod ? devtool = false : devtool = 'source-map'
    return devtool
}

const getLoaders = () => ({
    rules: [{
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
                use: [{
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            sourceMap: true,
                            minimize: true,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true,
                            plugins: (loader) => {
                                if (isprod) {
                                    return [
                                        require('postcss-import')({
                                            root: loader.resourcePath
                                        }),
                                        require('autoprefixer')(),
                                        require('cssnano')({
                                            discardComments: {
                                                removeAll: true
                                            },
                                            discardUnused: false,
                                            mergeIdents: false,
                                            reduceIdents: false,
                                            safe: true,
                                        }),
                                    ]
                                } else {
                                    return [
                                        require('postcss-import')({
                                            root: loader.resourcePath
                                        }),
                                        require('autoprefixer')(),
                                    ]
                                }
                            },
                        },
                    },
                    'sass-loader',
                ],
            })
        },
        {
            test: path.resolve(__dirname, 'src/styles/fonts'),
            loader: 'file-loader',
            options: {
                name: 'styles/fonts/[name].[ext]'
            }
        },
        {
            test: path.resolve(__dirname, 'src/styles/images'),
            loader: 'file-loader',
            options: {
                emitFile: true, // Don't forget emit images. 
                name: 'styles/images/[name].[ext]',
            },
        },
    ]
})

const getPlugins = () => {
    let plugins = []
    plugins.push(
        new ExtractTextPlugin(
            'styles.css', {
                allChunks: true
            }
        ),
        new HtmlWebpackPlugin({
            title: 'Project Demo',
            template: './src/index.html',
            hash: false,
            inject: 'body',
            minify: {
                caseSensitive: true,
                collapseWhitespace: true
            }
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        })
    )
    if (isprod) {
        plugins.push(
            new optimize.UglifyJsPlugin({
                comments: false
            }),
            new cleanWebpackPlugin(['public/*.*'], {
                verbose: true
            }),
            new ImageminWebpackPlugin({
                bail: false,
                excludeChunksAssets: false,
                imageminOptions: {
                    plugins: [
                        imageminGifsicle()
                    ],
                },
                manifest: imageminManifest, // This object will contain source and interpolated filenames. 
                maxConcurrency: os.cpus().length,
                name: 'styles/images/[hash].[ext]',
                test: path.resolve(__dirname, 'src/styles/images'),
            })
        )
    } else {
        plugins.push(new NamedModulesPlugin())
    }
    return plugins
}

const getDevServer = () => ({
    contentBase: path.resolve(__dirname, 'src'),
    open: true,
    historyApiFallback: true,
    overlay: {
        warnings: true,
        errors: true
    },
    compress: true,
    port: 3000,
})

const getOutput = () => ({
    path: path.resolve(__dirname, 'public'),
    filename: '[name].index.js'
})

module.exports = {
    target: 'web',
    context: path.resolve(__dirname),
    devtool: getDevtool(),
    entry: ['./index.js'],
    module: getLoaders(),
    plugins: getPlugins(),
    devServer: getDevServer(),
    output: getOutput()
}

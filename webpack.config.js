//Dependencies
const path = require('path')
const webpack = require('webpack')
const { optimize, NamedModulesPlugin } = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const cleanWebpackPlugin = require('clean-webpack-plugin')

const prod = process.env.NODE_ENV === 'production'
const getDevtool = () => {
    let devtool
    prod ? devtool = false : devtool = 'source-map'
    return devtool
}
const getLoaders = () =>({
        rules:[
            {
                test:/\.scss$/,
                use: ExtractTextPlugin.extract({
                    use:[
                        {
                            loader: 'css-loader',
                            options: { 
                                importLoaders: 1,
                                sourceMap: true,
                            },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: true,
                                plugins: (loader) => {
                                     if(prod) {
                                        return [
                                            require('postcss-import')({ root: loader.resourcePath }),
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
                                    }
                                    else {
                                        return [
                                            require('postcss-import')({ root: loader.resourcePath }),
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
            // {
            //      test: /\.(js|jsx)$/,
            //     use: {
            //         loader: 'babel-loader',
            //         options: {
            //             presets: ['es2015'],
            //         }
            //     }
            // },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            mimetype:'image/svg+xml',
                            // name: '[name].[ext]',
                            // outputPath: 'images/'
                        }
                    }
                ]
            }
        ]
})

const getPlugins = () => {
    let plugins=[]
    plugins.push(
        new ExtractTextPlugin(
            'styles.css',
            {allChunks: true}
        ),
        new HtmlWebpackPlugin({
            title: 'Project Demo',
            template: './src/index.html',
            hash: true,
            inject: 'body',
            minify:{
                caseSensitive:true,
                collapseWhitespace:true
            }
        }),
        new webpack.DefinePlugin({
            'process.env': {'NODE_ENV': JSON.stringify('production')}
        })
    )
    if(prod) {
        plugins.push(
            new optimize.UglifyJsPlugin ({comments:false}),
            new cleanWebpackPlugin(['public/*.*'], {verbose: true})
        )
    }
    else {
        plugins.push(new NamedModulesPlugin())
    }
    return plugins
}

const getDevServer = () =>({
    contentBase: path.resolve(__dirname,'src'),
    open: true,
    historyApiFallback: true,
    overlay: {
        warnings: true,
        errors: true
    },
    compress: true,
    port: 3000,
})

const getOutput = () =>({
    path: path.resolve(__dirname, 'public'),
    filename: '[name].index.js'
})

module.exports =  {
    target:'web',
    context: path.resolve(__dirname),
    devtool: getDevtool(),
    entry:['./src/index.js'],
    module: getLoaders(),
    plugins: getPlugins(),
    devServer: getDevServer(),
    output: getOutput()
}

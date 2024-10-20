module.exports = (env, options) => {
    const isProduction = options.mode === 'production'
    const path = require('path')
    const HtmlWebpackPlugin = require('html-webpack-plugin')
    const {CleanWebpackPlugin} = require('clean-webpack-plugin')
    const MiniCssExtractPlugin = require('mini-css-extract-plugin')
    const CopyPlugin = require('copy-webpack-plugin')
    const SpriteLoaderPlugin = require('svg-sprite-loader/plugin')

    return {
        context: path.resolve(__dirname, 'source'),
        mode: isProduction ? 'production' : 'development',
        target: isProduction ? 'browserslist' : 'web',
        devtool: isProduction ? false : 'eval-cheap-module-source-map',
        optimization: {
            removeEmptyChunks: true,
            splitChunks: {
                chunks: 'all'
            }
        },
        entry: {
            main: [
                //"@babel/polyfill",
                './js/index.js',
                './css/main.css'
            ]
        },
        output: {
            path: path.resolve(__dirname, 'public'),
            filename: 'js/[name].[chunkhash].js',
            assetModuleFilename: '[path][contenthash][ext]'
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'source')
            }
        },
        experiments: {
            /*asset: true*/
        },
        devServer: {
            compress: true,
            port: 9000,
            hot: true,
            client: {
                overlay: true,
            }
        },
        module: {
            rules: [
                {
                    test: /\.html$/i,
                    loader: 'html-loader'
                },
                {
                    test: /\.(js|jsx)$/,
                    exclude: /(node_modules)/,
                    loader: 'babel-loader'
                },
                {
                    test: /\.(scss|css)$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                publicPath: '../'
                            }
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: !isProduction
                            }
                        },
                        {
                            loader: 'postcss-loader'
                        }
                    ]
                },
                {
                    test: /\.(eot|svg|ttf|woff|woff2)$/,
                    type: 'asset/resource'
                },
                {
                    test: /\.svg$/,
                    include: path.resolve(__dirname, 'source/assets/sprite'),
                    use: [
                        {
                            loader: 'svg-sprite-loader',
                            options: {
                                extract: true,
                                outputPath: 'assets/sprite/',
                                spriteFilename: 'icons.svg',
                                runtimeCompat: true
                            }
                        },
                        {
                            loader: 'svgo-loader',
                            options: {
                                plugins: [
                                    {removeNonInheritableGroupAttrs: true},
                                    {collapseGroups: true},
                                    {removeAttrs: {attrs: '(fill|stroke)'}}
                                ]
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin(),
            // new CopyPlugin({
            //     patterns: [
            //         // from, to
            //     ]
            // }),
            new MiniCssExtractPlugin({
                filename: 'css/[name].[contenthash].css',
                chunkFilename: 'css/[id].[contenthash].css'
            }),
            new HtmlWebpackPlugin({
                filename: `index.html`,
                template: 'index.html',
                minify: false,
                scriptLoading: 'blocking'
            }),
            new SpriteLoaderPlugin({
                plainSprite: true
            })
        ]
    }
}

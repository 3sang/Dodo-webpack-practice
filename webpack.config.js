const path = require('path');
const TerserPlugin = require('terser-webpack-plugin'); // 引入压缩插件
var HotModuleReplacementPlugin = require('webpack').HotModuleReplacementPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// 可以优化打包体积，在打包结束的时候，会启动启动一个服务在浏览器查看打包的大小和包含的内容等
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// 自写plugin
const ChangeThemeColorPlugin = require('./src/plugins/change-theme-color-plugin');

module.exports = {
  mode: 'development',
  // 因为默认是production 默认会进行压缩
  // mode选项定义的NODE_ENV 作用于webpack入口文件下的业务代码，通常为src文件夹下的代码，
  // 而 npm脚本里的设置多用于配置相关,cross-env设置NODE_ENV=production（命令行里）,使用process.env.NODE_ENV获取，例如在webpack.config.js里区分环境配置不同插件
  entry: {
    main: './src/index.js',
    // main: './src/pages/TestThemeColor.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]-[fullhash:5].js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.wasm', '.mjs', '.js', '.json', '.jsx'], // 解析扩展。（当我们通过路导入文件，找不到改文件时，会尝试加入这些后缀继续寻找文件）
    alias: {
      '@': path.join(__dirname, 'src'), // 在项目中使用@符号代替src路径，导入文件路径更方便
    },
  },
  resolveLoader: {
    // loader搜索目录，包括自己写的，还要添加 'node_modules' 目录
    modules: [path.join(__dirname, './src/loaders'), 'node_modules'],
  },
  optimization: {
    minimize: true,
    minimizer: [
      // 自定义js优化配置，将会覆盖默认配置
      new UglifyJsPlugin({
        parallel: true, //使用多进程并行运行来提高构建速度
        sourceMap: false,
        uglifyOptions: {
          warnings: false,
          compress: {
            unused: true,
            drop_debugger: true,
            // drop_console: true,
          },
          output: {
            comments: false, // 去掉注释
          },
        },
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          discardComments: { removeAll: true }, // 移除注释
        },
      }),
    ],
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30, // 最大的初始化加载请求次数,为了对请求数做限制，不至于拆分出来过多模块
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
          name: 'defaultVendors',
        },
        antdui: {
          priority: 2,
          name: 'antdui',
          test: /[\\/]node_modules[\\/](antd)[\\/]/, //(module) => (/antd/.test(module.context)),
        },
        // 拆分基础插件
        basic: {
          priority: 3,
          name: 'basic',
          test: /[\\/]node_modules[\\/](moment|react|react-dom|react-router|react-router-dom|mobx|mobx-react|axios)[\\/]/,
        },
        // 默认的配置，vendors规则不命中的话，就会命中这里
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  devServer: {
    // 开发服务器
    contentBase: path.join(__dirname, 'dist'), // 发布目录
    historyApiFallback: true, // 当找不到路径的时候，默认加载index.html文件
    host: 'localhost',
    compress: true, // 启用gzip压缩
    publicPath: '/', // 访问资源加前缀
    port: 6030,
    hot: true,
    inline: true, // 实时更新
    open: true, // 是否默认打开浏览器
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/, // jsx/js文件的正则
        exclude: /node_modules/, // 排除 node_modules 文件夹
        use: {
          // loader 是 babel
          loader: 'babel-loader',
          options: {
            // babel 转义的配置选项
            babelrc: false,
            presets: [
              // 添加 preset-react
              require.resolve('@babel/preset-react'),
              [require.resolve('@babel/preset-env'), { modules: false }],
            ],
            /**
             * 该配置使用babel-plugin-import 按需加载 antd样式，不加该配置信息antd组建的样式会无法显示。
             * babel-plugin-import 在 babel 运行时，将类似import { ModuleName } from 'libiaryName'的代码转化为组件所在的路径，这样实际引用的就是这个组件的模块而不是整个 Library
             */
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-object-rest-spread',
              'lodash',
              ['import', { libraryName: 'antd', libraryDirectory: 'lib', style: 'css' }],
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: false,
              // modules: {
              //   namedExport: true,
              // },
              publicPath: '../',
            },
          },
          // 'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                getLocalIdent: (context, localIdentName, localName, options) => {
                  if (
                    context.resourcePath.includes('node_modules') ||
                    context.resourcePath.includes('ant.design.pro.less')
                  ) {
                    return localName;
                  }
  
                  const match = context.resourcePath.match(/src(.*)/);
                  if (match && match[1]) {
                    const pathname = match[1].replace('.less', '');
                    const name = pathname.split('\\').join('-');
                    return `ddo-${name}-${localName}`;
                  }
                  return localName;
                },
              },
            },
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: false,
              // modules: {
              //   namedExport: true,
              // },
              publicPath: '../',
            },
          },
          // 'style-loader',
          // 'css-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                getLocalIdent: (context, localIdentName, localName, options) => {
                  if (
                    context.resourcePath.includes('node_modules') ||
                    context.resourcePath.includes('ant.design.pro.less')
                  ) {
                    return localName;
                  }
  
                  const match = context.resourcePath.match(/src(.*)/);
                  if (match && match[1]) {
                    const pathname = match[1].replace('.less', '');
                    const name = pathname.split('\\').join('-');
                    return `ddo-${name}-${localName}`;
                  }
                  return localName;
                },
              },
            },
          },
          'less-loader',
        ],
      },
      {
        test: /\.html$/,
        use: ['html-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000, // url-loader 包含file-loader，这里不用file-loader, 小于10000B的图片base64的方式引入，大于10000B的图片以路径的方式导入
          name: 'static/img/[name].[fullhash:5].[ext]',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000, // 小于10000B的图片base64的方式引入，大于10000B的图片以路径的方式导入
          name: 'static/fonts/[name].[fullhash:5].[ext]',
        },
      },
    ],
  },
  plugins: [
    new HotModuleReplacementPlugin(),
    // 以该文件下的本地index.html作为模板,打包的时候自动生成服务器html并自动引入打包的js文件
    new HtmlWebpackPlugin({
      template: path.join(__dirname, './src/index.html'),
      filename: path.join(__dirname, './dist/index.html'),
      inject: true, // true：默认值，script标签位于html文件的 body 底部
      hash: true, // 在打包的资源插入html会加上hash
      //  html 文件进行压缩
      minify: {
        removeComments: true, //去注释
        collapseWhitespace: true, //压缩空格
        removeAttributeQuotes: true, //去除属性 标签的 引号  例如 <p id="test" /> 输出 <p id=test/>
      },
    }),
    new CleanWebpackPlugin(),
    // new BundleAnalyzerPlugin(),
    new MiniCssExtractPlugin({
      // filename: '[name]-[fullhash:5].css',
    }),
    new ChangeThemeColorPlugin({
      primaryColor: '#096dd9',
    }),
  ],
  devtool: 'source-map',
};

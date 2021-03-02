const path = require('path');
const TerserPlugin = require('terser-webpack-plugin'); // 引入压缩插件
var HotModuleReplacementPlugin = require('webpack').HotModuleReplacementPlugin;

module.exports = {
  mode: 'none',
  // 因为默认是production 默认会进行压缩
  // mode选项定义的NODE_ENV 作用于webpack入口文件下的业务代码，通常为src文件夹下的代码，
  // 而 npm脚本里的设置多用于配置相关,cross-env设置NODE_ENV=production（命令行里）,使用process.env.NODE_ENV获取，例如在webpack.config.js里区分环境配置不同插件
  entry: {
    example: './src/pages/index.js',
    // 'ResizableTable.min': './src/index.js',
    // vendors: ['react-resizable'],
  },
  output: {
    path: path.join(__dirname, 'dist/lib'),
    library: 'resizableTable',
    libraryTarget: 'umd',
    libraryExport: 'default', // 不添加的话引用的时候需要 xxx.default
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.wasm', '.mjs', '.js', '.json', '.jsx'],
  },
  resolveLoader: {
    // 因为 html-loader 是开源 npm 包，所以这里要添加 'node_modules' 目录
    modules: [path.join(__dirname, './src/loaders'), 'node_modules'],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        // 使用压缩插件
        include: /\.min\.js$/,
      }),
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist/lib'),
    host: 'localhost',
    compress: true,
    port: 6030,
    hot: true,
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
              ['import', { libraryName: 'antd', libraryDirectory: 'lib', style: 'css' }],
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'html-minify-loader',
          {
            loader: 'css-loader',
            options: {
              getLocalIdent: (context, localIdentName, localName, options) => {
                // 依赖包里和global.less里的不动
                console.log(context);
                if (
                  context.resourcePath.includes('node_modules') ||
                  context.resourcePath.includes('ant.design.pro.less') ||
                  context.resourcePath.includes('global.less')
                ) {
                  return localName;
                }
                const match = context.resourcePath.match(/src(.*)/);
                if (match && match[1]) {
                  const antdProPath = match[1].replace('.less', '');
                  const arr = slash(antdProPath)
                    .split('/')
                    .map(a => a.replace(/([A-Z])/g, '-$1'))
                    .map(a => a.toLowerCase());
                  return `dodo-${arr.join('-')}-${localName}`.replace(/--/g, '-');
                }
                return localName;
              },
            },
          },
        ],
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
      {
        test: /\.html$/,
        use: [
          'html-loader',
          {
            loader: 'html-minify-loader',
            options: {
              comments: false,
            },
          },
        ],
      },
    ],
  },
  plugins: [new HotModuleReplacementPlugin()],
  devtool: 'source-map',
  // 使自己项目中依赖于宿主项目里的库，不重复打包,比如react，因为引入的肯定是react项目，所以不需要再将react打包进npm包
  externals: {
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
      root: 'React',
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'react-dom',
      root: 'ReactDOM',
    },
    lodash: 'lodash',
  },
};

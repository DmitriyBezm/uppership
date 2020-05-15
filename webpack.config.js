const path = require('path');
const fs = require('fs');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack')

const PATHS = {
  source: path.join(__dirname, 'source'),
  dist: path.join(__dirname, 'dist'),
  assets: 'assets'
};

const PAGES_DIR = `${PATHS.source}/pages/`
const PAGES = fs.readdirSync(PAGES_DIR).filter(folder => (
  fs.readdirSync(path.join(PAGES_DIR, folder))
    .some(file => file.endsWith('.pug'))
))

module.exports = {
  externals: {
    paths: PATHS,
  },
  entry: PATHS.source,
  output: {
    path: PATHS.dist,
    filename: `${PATHS.assets}/js/[name].[hash].js`,
    publicPath: '/',
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: 'vendors',
          test: /node_modules/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: 'pug-loader',
        options: {
          pretty: true,
        }
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: (resourcePath, context) => {
                return path.relative(path.dirname(resourcePath), context) + '../../img/';
              },
            },
          },
          {
            loader: 'css-loader',
            options: { sourceMap: true }
          }, {
            loader: 'postcss-loader',
            options: { sourceMap: true, config: { path: `./postcss.config.js` } }
          }, {
            loader: 'less-loader',
            options: { sourceMap: true }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { sourceMap: true }
          }, {
            loader: 'postcss-loader',
            options: { sourceMap: true, config: { path: `./postcss.config.js` } }
          }
        ]
      }
    ]
  },
  devServer: {
    hot: true,
    port: 9000,
    contentBase: PATHS.dist,
    // writeToDisk: true,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: `${PATHS.assets}/styles.css`,
    }),
    new CopyWebpackPlugin([
      { from: `${PATHS.source}/${PATHS.assets}/img`, to: `${PATHS.assets}/img` },
      { from: `${PATHS.source}/${PATHS.assets}/fonts`, to: `${PATHS.assets}/fonts` },
      { from: `${PATHS.source}/static`, to: '' },
    ]),
    // Automatic creation any html pages (Don't forget to RERUN dev server)
    // see more: https://github.com/vedees/webpack-template/blob/master/README.md#create-another-html-files
    // best way to create pages: https://github.com/vedees/webpack-template/blob/master/README.md#third-method-best
    ...PAGES.map(page => {
      const name = page.replace(/\.pug/,'');
      return new HTMLWebpackPlugin({
        template: `${PAGES_DIR}/${name}/index.pug`,
        filename: `./${name}.html`,
        chunks: [name]
      })
    }),

    new webpack.SourceMapDevToolPlugin({
      filename: '[file].map'
    }),
  ],
  resolve: {
    alias: {
      source: PATHS.source
    }
  },
}

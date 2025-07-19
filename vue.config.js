const { defineConfig } = require('@vue/cli-service');
const WorkboxPlugin = require('workbox-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  productionSourceMap: process.env.NODE_ENV !== 'production',

  pwa: {
    workboxPluginMode: 'InjectManifest',
    swSrc: 'src/sw.js',
  },

  

  css: {
    loaderOptions: {
      scss: {
        additionalData: `
          @import "@/assets/styles/variables.scss";
        `
      }
    },
    // Extract CSS in production
    extract: process.env.NODE_ENV === 'production'
  },

  // Configure webpack for code splitting and optimization
  configureWebpack: config => {
    const configurations = {
      optimization: {
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 250000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                // Get the name. E.g. node_modules/packageName/not/this/part.js
                // or node_modules/packageName
                const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                if (!match) {
                  return 'vendor.other';
                }
                const packageName = match[1];
                // npm package names are URL-safe, but some servers don't like @ symbols
                return `vendor.${packageName.replace('@', '')}`;
              },
              priority: -10
            },
            common: {
              name: 'chunk-common',
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true
            }
          }
        }
      },
      performance: {
        hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
      }
    };

    // Add production-only plugins
    if (process.env.NODE_ENV === 'production') {
      // Add service worker for offline support
      configurations.plugins = [
        // Compress assets
        new CompressionPlugin({
          filename: '[path][base].gz',
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 10240,
          minRatio: 0.8
        })
      ];

      // Add bundle analyzer only when explicitly requested
      if (process.env.ANALYZE) {
        configurations.plugins.push(new BundleAnalyzerPlugin());
      }
    }

    return configurations;
  },

  // Chain webpack configuration
  chainWebpack: config => {
    // Disable prefetch for non-critical resources
    config.plugins.delete('prefetch');

    // SVG loader
    config.module
      .rule('svg')
      .exclude.add(/node_modules/)
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader');

    // Set source maps
    if (process.env.NODE_ENV === 'production') {
      config.devtool('source-map');
    } else {
      config.devtool('eval-cheap-module-source-map');
    }

    // Image optimization
    config.module
      .rule('images')
      .use('image-webpack-loader')
      .loader('image-webpack-loader')
      .options({
        bypassOnDebug: true,
        disable: process.env.NODE_ENV !== 'production'
      });
  }
});

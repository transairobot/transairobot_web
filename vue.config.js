const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
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
  configureWebpack: {
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
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
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
      hints: 'warning',
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }
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
  }
});

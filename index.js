const cssLoaderConfig = require('./css-loader-config');


const config = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      const webpackOptions = options;
      const cssRegex = /\.(pcss|css)$/;
      const cssModuleRegex = /\.module\.css$/;

      if (!webpackOptions.defaultLoaders) {
        throw new Error(
          'This plugin is not compatible with Next.js versions below 5.0.0 https://err.sh/next-plugins/upgrade',
        );
      }

      const { dev, isServer } = webpackOptions;
      const { cssModules, cssLoaderOptions, postcssLoaderOptions, exclude } = nextConfig;

      // console.log('-----------------------');
      // console.log('cssModules', cssModules);
      // console.log('exclude', exclude);

      webpackOptions.defaultLoaders.css = cssLoaderConfig(config, {
        extensions: cssModules ? [
          'css',
          'pcss',
        ] : [
          'module.css',
        ],
        cssModules,
        cssLoaderOptions,
        postcssLoaderOptions,
        dev,
        isServer,
      });


      const cssRule = {
        test: cssRegex,
        issuer(issuer) {
          if (issuer.match(/pages[\\/]_document\.js$/)) {
            throw new Error(
              'You can not import CSS files in pages/_document.js, use pages/_app.js instead.',
            );
          }
          return true;
        },
        use: webpackOptions.defaultLoaders.css,
      };

      // console.log(webpackOptions.defaultLoaders.css);

      const cssModuleRule = {
        test: cssModuleRegex,
        issuer(issuer) {
          if (issuer.match(/pages[\\/]_document\.js$/)) {
            throw new Error(
              'You can not import CSS files in pages/_document.js, use pages/_app.js instead.',
            );
          }
          return true;
        },
        use: cssLoaderConfig(config, {
          extensions: 'module.css',
          cssModules: {
            mode: 'local',
            localIdentName: '[name]__[local]--[hash:base64:5]',
          },
          cssLoaderOptions,
          postcssLoaderOptions,
          dev,
          isServer,
        }),
      };

      if (exclude) {
        cssRule.exclude = exclude;
      }

      config.module.rules.push(cssRule);
      config.module.rules.push(cssModuleRule);

      // console.log('==============');
      // console.log(config.module.rules);


      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, webpackOptions);
      }

      return config;
    },
  });
};


module.exports = config;

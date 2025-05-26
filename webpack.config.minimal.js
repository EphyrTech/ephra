const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      // Minimal configuration to avoid CRC errors
      mode: 'development',
    },
    argv
  );

  // Disable optimization to prevent CRC errors
  config.optimization = {
    minimize: false,
    splitChunks: false,
  };

  // Disable cache
  config.cache = false;

  // Reduce memory usage
  config.stats = 'minimal';

  return config;
};

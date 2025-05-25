const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      // Passing true will enable the default Expo webpack config
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          // Add any packages here that need to be transpiled
        ],
      },
    },
    argv
  );

  // Customize the config before returning it.
  // For example, you could add a new plugin or modify existing ones

  return config;
};

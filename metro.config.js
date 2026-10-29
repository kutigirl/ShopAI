const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const path = require('path');

const config = {
  projectRoot: __dirname,
  watchFolders: [__dirname],
  resolver: {
    blockList: [
      new RegExp(`^${path.resolve(__dirname, 'shopai-backend').replace(/\\/g, '\\\\')}.*`),
      new RegExp(`^${path.resolve(__dirname, 'KTXGo_23710971').replace(/\\/g, '\\\\')}.*`),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

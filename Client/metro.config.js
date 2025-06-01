const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add any custom config here
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json', 'svg'];
config.resolver.assetExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'ttf', 'otf'];

// Increase the max workers
config.maxWorkers = 4;

// Enable the new resolver
config.resolver.unstable_enablePackageExports = true;

// Add SVG transformer
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

module.exports = config; 
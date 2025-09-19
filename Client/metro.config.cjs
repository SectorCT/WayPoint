const { getDefaultConfig } = require("expo/metro-config");

const config = async () => {
  const defaultConfig = await getDefaultConfig(__dirname);

  const { transformer, resolver } = defaultConfig;

  return {
    ...defaultConfig,
    transformer: {
      ...transformer,
      babelTransformerPath: require.resolve(
        "react-native-svg-transformer/expo",
      ),
    },
    resolver: {
      ...resolver,
      assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
      sourceExts: [...resolver.sourceExts, "svg", "sql"],
    },
    // Increase the max workers for better performance
    maxWorkers: 4,
  };
};

module.exports = config;

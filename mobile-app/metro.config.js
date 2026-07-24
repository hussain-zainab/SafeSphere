const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fixes a known compatibility issue between Firebase's newer ESM exports
// and Metro's bundler resolution.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
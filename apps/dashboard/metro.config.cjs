const { getDefaultConfig } = require('expo/metro-config');

// Expo detects pnpm workspaces and configures Metro's symlink resolution,
// watch folders, and module lookup for the monorepo.
module.exports = getDefaultConfig(__dirname);

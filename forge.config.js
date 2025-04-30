const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: './icon', // Move to root, no need for icons folder
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],
      config: {
        authors: 'Your Name',
        description: 'Music Player App',
        iconUrl: 'https://raw.githubusercontent.com/yourusername/musicetch/main/icon.ico',
        setupIcon: './icon.ico',
      },
    },
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {
        icon: './icon.icns',
        format: 'ULFO',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      config: {},
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['linux', 'win32'],
    },
    {
      name: '@electron-forge/maker-deb',
      platforms: ['linux'],
      config: {
        options: {
          icon: './icon.png',
          maintainer: 'Your Name',
          homepage: 'https://github.com/yourusername/musicetch',
          categories: ['AudioVideo', 'Audio'],
        },
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      platforms: ['linux'],
      config: {
        options: {
          icon: './icon.png',
          maintainer: 'Your Name',
          homepage: 'https://github.com/yourusername/musicetch',
          categories: ['AudioVideo', 'Audio'],
        },
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

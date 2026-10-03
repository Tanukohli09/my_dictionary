const { withAndroidManifest } = require('expo/config-plugins');

function secureManifest(manifest) {
  for (const application of manifest.manifest.application || []) {
    application.$ = { ...application.$, 'android:usesCleartextTraffic': 'false' };
  }
  return manifest;
}

module.exports = config => withAndroidManifest(config, config => {
  config.modResults = secureManifest(config.modResults);
  return config;
});
module.exports.secureManifest = secureManifest;

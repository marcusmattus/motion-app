export default {
  expo: {
    name: 'Motion',
    slug: 'motion',
    version: '1.0.0',
    scheme: 'motion',
    orientation: 'portrait',
    icon: './assets/logo.png',
    platforms: ['ios', 'android'],
    splash: {
      image: './assets/logo.png',
      resizeMode: 'contain',
      backgroundColor: '#111111'
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      bundleIdentifier: 'com.motion.ai',
      supportsTablet: true
    },
    android: {
      package: 'com.motion.ai',
      adaptiveIcon: {
        foregroundImage: './assets/logo.png',
        backgroundColor: '#111111'
      }
    },
    plugins: ['expo-router'],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: '6eb7bcc6-cf81-4f96-a11c-a84165ffd3e7'
      }
    }
  }
};

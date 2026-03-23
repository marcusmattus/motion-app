import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../src/lib/theme';
import { useMotionStore } from '../src/state/store';

export default function SplashRouter() {
  const router = useRouter();
  const hasCompletedOnboarding = useMotionStore((s) => s.hasCompletedOnboarding);

  useEffect(() => {
    // Small delay for splash effect
    const timer = setTimeout(() => {
      if (hasCompletedOnboarding) {
        router.replace('/(tabs)/today');
      } else {
        router.replace('/onboarding');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasCompletedOnboarding, router]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E90FF', '#00FF7F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.logoContainer}
      >
        <View style={styles.logoMark}>
          <View style={styles.mLeft} />
          <View style={styles.mRight} />
        </View>
      </LinearGradient>
      <ActivityIndicator color={colors.primary} size="small" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  mLeft: {
    width: 20,
    height: 50,
    backgroundColor: 'white',
    marginRight: 4,
    transform: [{ skewX: '-10deg' }],
  },
  mRight: {
    width: 20,
    height: 50,
    backgroundColor: 'white',
    marginLeft: 4,
    transform: [{ skewX: '10deg' }],
  },
  loader: {
    marginTop: 32,
  },
});

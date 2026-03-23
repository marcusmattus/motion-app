import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../lib/theme';
import { MotionButton } from './MotionButton';
import { useMotionStore } from '../state/store';

const { width, height } = Dimensions.get('window');

interface OnboardingPage {
  id: string;
  title: string;
  body: string;
  cta: string;
}

const pages: OnboardingPage[] = [
  {
    id: 'welcome',
    title: 'Welcome to Motion.',
    body: "We'll guide you to stronger form and lasting consistency.",
    cta: 'Get Started',
  },
  {
    id: 'privacy',
    title: 'Your Privacy is Key.',
    body: 'Your form data stays on-device by default. You choose what to share.',
    cta: 'Understand',
  },
  {
    id: 'calibration',
    title: "Let's build your Avatar.",
    body: 'Stand in frame to capture your unique body shape. This helps us personalize feedback.',
    cta: 'Calibrate Now',
  },
  {
    id: 'ready',
    title: "You're all set!",
    body: 'Explore your personalized Coach, track progress, and connect with friends.',
    cta: 'Go to App',
  },
];

export function OnboardingFlow() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { setOnboardingComplete } = useMotionStore();

  const handleNext = () => {
    if (currentIndex === pages.length - 1) {
      setOnboardingComplete(true);
      router.replace('/(tabs)/today');
    } else if (pages[currentIndex].id === 'calibration') {
      // Navigate to calibration screen
      router.push('/onboarding/calibration');
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    setOnboardingComplete(true);
    router.replace('/(tabs)/today');
  };

  const renderPage = ({ item, index }: { item: OnboardingPage; index: number }) => (
    <View style={styles.page}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={['#1E90FF', '#00FF7F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconGradient}
        >
          <Text style={styles.iconText}>M</Text>
        </LinearGradient>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.body}>{item.body}</Text>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {pages.map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View
            key={index}
            style={[styles.dot, { width: dotWidth, opacity }]}
          />
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.skipContainer}>
        <MotionButton
          label="Skip Tour"
          variant="ghost"
          size="sm"
          onPress={handleSkip}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={pages}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      {renderDots()}

      <View style={styles.ctaContainer}>
        <MotionButton
          label={pages[currentIndex].cta}
          variant="gradient"
          size="lg"
          fullWidth
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: spacing.lg,
    zIndex: 10,
  },
  page: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xxl,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.charcoal,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  body: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginHorizontal: 4,
  },
  ctaContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
});

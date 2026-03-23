import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, CameraType } from 'expo-camera';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MotionButton } from '../../src/components/MotionButton';
import { colors, spacing, radius } from '../../src/lib/theme';
import { useMotionStore } from '../../src/state/store';

export default function CalibrationScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [step, setStep] = useState<'intro' | 'capture' | 'processing' | 'done'>('intro');
  const [capturedData, setCapturedData] = useState<any>(null);
  const cameraRef = useRef<Camera>(null);
  const { setCalibrationComplete, setUser, user } = useMotionStore();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current) return;

    setStep('processing');

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.8,
      });

      // Simulate pose detection and body proportion extraction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock body proportions (in real app, this would come from pose model)
      const bodyProportions = {
        shoulderWidth: 0.45,
        torsoLength: 0.35,
        armLength: 0.32,
        legLength: 0.48,
        hipWidth: 0.28,
      };

      setCapturedData(bodyProportions);
      setUser({
        ...user,
        bodyProportions,
      });
      setStep('done');
    } catch (error) {
      Alert.alert('Capture Failed', 'Please try again.');
      setStep('capture');
    }
  }, [user, setUser]);

  const handleComplete = () => {
    setCalibrationComplete(true);
    router.replace('/(tabs)/today');
  };

  const handleSkip = () => {
    setCalibrationComplete(true);
    router.replace('/(tabs)/today');
  };

  if (step === 'intro') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.introContent}>
          <View style={styles.iconContainer}>
            <Icon name="human" size={64} color={colors.primary} />
          </View>
          <Text style={styles.title}>Avatar Calibration</Text>
          <Text style={styles.description}>
            Stand facing the camera in a neutral pose. We'll capture your body proportions to create your personalized avatar and provide accurate form feedback.
          </Text>

          <View style={styles.instructionList}>
            <View style={styles.instructionItem}>
              <Icon name="check-circle" size={20} color={colors.primaryGreen} />
              <Text style={styles.instructionText}>Stand 6-8 feet from camera</Text>
            </View>
            <View style={styles.instructionItem}>
              <Icon name="check-circle" size={20} color={colors.primaryGreen} />
              <Text style={styles.instructionText}>Wear fitted clothing</Text>
            </View>
            <View style={styles.instructionItem}>
              <Icon name="check-circle" size={20} color={colors.primaryGreen} />
              <Text style={styles.instructionText}>Arms at sides, feet shoulder-width</Text>
            </View>
            <View style={styles.instructionItem}>
              <Icon name="check-circle" size={20} color={colors.primaryGreen} />
              <Text style={styles.instructionText}>Good lighting, minimal background</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <MotionButton
            label="Start Calibration"
            variant="gradient"
            size="lg"
            fullWidth
            onPress={async () => {
              if (!hasPermission) {
                const { status } = await Camera.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                  Alert.alert('Camera Required', 'Camera access is needed for calibration.');
                  return;
                }
                setHasPermission(true);
              }
              setStep('capture');
            }}
          />
          <MotionButton
            label="Skip for Now"
            variant="ghost"
            size="md"
            onPress={handleSkip}
            style={styles.skipButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'capture') {
    return (
      <View style={styles.cameraContainer}>
        <Camera ref={cameraRef} style={styles.camera} type={CameraType.front}>
          <View style={styles.cameraOverlay}>
            {/* Guide outline */}
            <View style={styles.guideContainer}>
              <View style={styles.guideOutline}>
                <View style={styles.guideHead} />
                <View style={styles.guideTorso} />
                <View style={styles.guideLegs} />
              </View>
              <Text style={styles.guideText}>Align yourself with the outline</Text>
            </View>

            {/* Bottom controls */}
            <View style={styles.captureControls}>
              <Text style={styles.captureHint}>
                Stand in a neutral pose and tap capture
              </Text>
              <MotionButton
                label="Capture"
                variant="gradient"
                size="lg"
                fullWidth
                icon={<Icon name="camera" size={24} color={colors.charcoal} />}
                onPress={handleCapture}
              />
            </View>
          </View>
        </Camera>
      </View>
    );
  }

  if (step === 'processing') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.processingContent}>
          <View style={styles.processingIcon}>
            <Icon name="robot" size={64} color={colors.primary} />
          </View>
          <Text style={styles.processingTitle}>Analyzing...</Text>
          <Text style={styles.processingText}>
            Detecting body landmarks and calculating proportions
          </Text>
          <View style={styles.loadingDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Done state
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.doneContent}>
        <View style={styles.successIcon}>
          <Icon name="check-circle" size={80} color={colors.primaryGreen} />
        </View>
        <Text style={styles.doneTitle}>Avatar Created!</Text>
        <Text style={styles.doneText}>
          Your personalized avatar is ready. The AI Coach will use your body proportions for accurate form feedback.
        </Text>

        {capturedData && (
          <View style={styles.metricsCard}>
            <Text style={styles.metricsTitle}>Captured Proportions</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Shoulder Width</Text>
              <Text style={styles.metricValue}>Detected ✓</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Torso Length</Text>
              <Text style={styles.metricValue}>Detected ✓</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Arm Length</Text>
              <Text style={styles.metricValue}>Detected ✓</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Leg Length</Text>
              <Text style={styles.metricValue}>Detected ✓</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <MotionButton
          label="Continue to App"
          variant="gradient"
          size="lg"
          fullWidth
          onPress={handleComplete}
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
  introContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl * 2,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  instructionList: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  instructionText: {
    fontSize: 15,
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  buttonContainer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  skipButton: {
    marginTop: spacing.md,
    alignSelf: 'center',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  guideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideOutline: {
    width: 150,
    height: 300,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    opacity: 0.7,
  },
  guideHead: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    marginTop: spacing.lg,
  },
  guideTorso: {
    width: 60,
    height: 80,
    borderWidth: 2,
    borderColor: colors.primary,
    marginTop: spacing.sm,
    borderRadius: radius.sm,
  },
  guideLegs: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  guideText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  captureControls: {
    padding: spacing.xl,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  captureHint: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  processingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  processingIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  processingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    marginTop: spacing.xl,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xs,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  doneContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  successIcon: {
    marginBottom: spacing.xl,
  },
  doneTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  doneText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  metricsCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  metricLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  metricValue: {
    fontSize: 14,
    color: colors.primaryGreen,
    fontWeight: '500',
  },
});

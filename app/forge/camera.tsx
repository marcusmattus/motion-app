import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MotionButton } from '../../src/components/MotionButton';
import { MotionCard } from '../../src/components/MotionCard';
import { colors, spacing, radius } from '../../src/lib/theme';

export default function ActiveMotion() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [reps, setReps] = useState(0);
  const [power, setPower] = useState(0);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setReps((r) => r + 1);
      setPower((p) => Math.min(100, p + 3));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const requestPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  return (
    <View style={styles.screen}>
      {hasPermission ? (
        <Camera style={styles.camera} type={CameraType.back} />
      ) : (
        <View style={styles.permissionBox}>
          <Icon name="camera-off" size={48} color={colors.textMuted} />
          <Text style={styles.permissionText}>Camera needed for pose tracking.</Text>
          <MotionButton label="Enable Camera" onPress={requestPermission} variant="secondary" />
        </View>
      )}
      <View style={styles.overlay}>
        <MotionCard variant="elevated" style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.metricValue}>{reps}</Text>
              <Text style={styles.metricLabel}>REPS</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.metricValue}>{power}%</Text>
              <Text style={styles.metricLabel}>POWER</Text>
            </View>
          </View>
        </MotionCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  camera: { flex: 1 },
  permissionBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  permissionText: { color: colors.textSecondary, marginVertical: spacing.md, textAlign: 'center' },
  overlay: {
    position: 'absolute',
    bottom: spacing.xxl,
    left: spacing.lg,
    right: spacing.lg,
  },
  statsCard: {
    paddingVertical: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  metricValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: colors.surface,
  },
});

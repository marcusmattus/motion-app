import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, CameraType } from 'expo-camera';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MotionCard } from '../../src/components/MotionCard';
import { MotionButton } from '../../src/components/MotionButton';
import { colors, spacing, radius, shadows } from '../../src/lib/theme';
import { useMotionStore } from '../../src/state/store';

const { width, height } = Dimensions.get('window');

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  icon: string;
}

const exercises: Exercise[] = [
  { id: 'squat', name: 'Barbell Back Squat', muscleGroup: 'Legs', difficulty: 'intermediate', equipment: ['barbell', 'rack'], icon: 'weight-lifter' },
  { id: 'deadlift', name: 'Conventional Deadlift', muscleGroup: 'Back', difficulty: 'advanced', equipment: ['barbell'], icon: 'weight' },
  { id: 'bench', name: 'Bench Press', muscleGroup: 'Chest', difficulty: 'intermediate', equipment: ['barbell', 'bench'], icon: 'seat-recline-extra' },
  { id: 'pushup', name: 'Push-Up', muscleGroup: 'Chest', difficulty: 'beginner', equipment: [], icon: 'human' },
  { id: 'row', name: 'Barbell Row', muscleGroup: 'Back', difficulty: 'intermediate', equipment: ['barbell'], icon: 'rowing' },
  { id: 'ohp', name: 'Overhead Press', muscleGroup: 'Shoulders', difficulty: 'intermediate', equipment: ['barbell'], icon: 'weight-lifter' },
];

export default function CoachScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [mode, setMode] = useState<'select' | 'camera' | 'active'>('select');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [reps, setReps] = useState(0);
  const [score, setScore] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Simulated pose tracking
  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
        setReps(r => r + 1);
        setScore(s => Math.min(100, s + Math.floor(Math.random() * 10) + 5));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isTracking]);

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setMode('camera');
  };

  const handleStartTracking = async () => {
    if (!hasPermission) {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Camera Required', 'Camera access is needed for form tracking.');
        return;
      }
      setHasPermission(true);
    }
    setMode('active');
    setIsTracking(true);
    setReps(0);
    setScore(0);
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    Alert.alert(
      'Workout Complete',
      `Great job! You completed ${reps} reps with a score of ${score}%`,
      [{ text: 'Done', onPress: () => setMode('select') }]
    );
  };

  if (mode === 'camera' || mode === 'active') {
    return (
      <View style={styles.cameraContainer}>
        {hasPermission ? (
          <Camera ref={cameraRef} style={styles.camera} type={CameraType.front}>
            {/* Overlay UI */}
            <View style={styles.cameraOverlay}>
              {/* Top bar */}
              <View style={styles.cameraTopBar}>
                <Pressable style={styles.backButton} onPress={() => setMode('select')}>
                  <Icon name="arrow-left" size={24} color={colors.textPrimary} />
                </Pressable>
                <View style={styles.exerciseBadge}>
                  <Text style={styles.exerciseBadgeText}>{selectedExercise?.name}</Text>
                </View>
              </View>

              {/* Skeleton overlay hint */}
              {mode === 'active' && (
                <View style={styles.skeletonHint}>
                  <View style={styles.jointDot} />
                  <View style={[styles.jointDot, { top: 60, left: 30 }]} />
                  <View style={[styles.jointDot, { top: 60, right: 30 }]} />
                  <View style={[styles.jointDot, { top: 120, left: 20 }]} />
                  <View style={[styles.jointDot, { top: 120, right: 20 }]} />
                </View>
              )}

              {/* Stats panel */}
              {mode === 'active' && (
                <View style={styles.statsPanel}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{reps}</Text>
                    <Text style={styles.statLabel}>REPS</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{score}%</Text>
                    <Text style={styles.statLabel}>FORM</Text>
                  </View>
                </View>
              )}

              {/* Coach cue */}
              {mode === 'active' && reps > 0 && (
                <View style={styles.coachCue}>
                  <Icon name="information" size={20} color={colors.primaryGreen} />
                  <Text style={styles.coachCueText}>
                    {reps % 3 === 0 ? 'Great depth!' : reps % 3 === 1 ? 'Keep knees over toes' : 'Brace your core'}
                  </Text>
                </View>
              )}

              {/* Bottom controls */}
              <View style={styles.cameraBottomBar}>
                {mode === 'camera' ? (
                  <MotionButton
                    label="Start Tracking"
                    variant="gradient"
                    size="lg"
                    fullWidth
                    onPress={handleStartTracking}
                  />
                ) : (
                  <MotionButton
                    label="Stop & Save"
                    variant="danger"
                    size="lg"
                    fullWidth
                    onPress={handleStopTracking}
                  />
                )}
              </View>
            </View>
          </Camera>
        ) : (
          <View style={styles.permissionContainer}>
            <Icon name="camera-off" size={64} color={colors.textMuted} />
            <Text style={styles.permissionTitle}>Camera Access Required</Text>
            <Text style={styles.permissionText}>
              The AI Coach needs camera access to track your form and count reps.
            </Text>
            <MotionButton
              label="Grant Access"
              variant="primary"
              onPress={async () => {
                const { status } = await Camera.requestCameraPermissionsAsync();
                setHasPermission(status === 'granted');
              }}
            />
          </View>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* AI Coach Banner */}
      <MotionCard variant="glow" style={styles.bannerCard}>
        <View style={styles.bannerContent}>
          <View style={styles.avatarContainer}>
            <Icon name="robot" size={48} color={colors.primary} />
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>AI Form Coach</Text>
            <Text style={styles.bannerSubtitle}>
              Real-time pose tracking & feedback
            </Text>
          </View>
        </View>
        <View style={styles.featureRow}>
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={16} color={colors.primaryGreen} />
            <Text style={styles.featureText}>Form scoring</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={16} color={colors.primaryGreen} />
            <Text style={styles.featureText}>Rep counting</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={16} color={colors.primaryGreen} />
            <Text style={styles.featureText}>Live cues</Text>
          </View>
        </View>
      </MotionCard>

      {/* Exercise Selection */}
      <Text style={styles.sectionTitle}>Select Exercise</Text>
      <View style={styles.exerciseGrid}>
        {exercises.map((exercise) => (
          <Pressable
            key={exercise.id}
            style={styles.exerciseCard}
            onPress={() => handleSelectExercise(exercise)}
          >
            <View style={styles.exerciseIconContainer}>
              <Icon name={exercise.icon} size={32} color={colors.primary} />
            </View>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseMuscle}>{exercise.muscleGroup}</Text>
            <View style={[
              styles.difficultyBadge,
              exercise.difficulty === 'beginner' && styles.beginnerBadge,
              exercise.difficulty === 'intermediate' && styles.intermediateBadge,
              exercise.difficulty === 'advanced' && styles.advancedBadge,
            ]}>
              <Text style={styles.difficultyText}>{exercise.difficulty}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Recent Sessions */}
      <Text style={styles.sectionTitle}>Recent Sessions</Text>
      <MotionCard>
        <View style={styles.sessionRow}>
          <Icon name="dumbbell" size={24} color={colors.primary} />
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionName}>Barbell Back Squat</Text>
            <Text style={styles.sessionMeta}>Yesterday · 4 sets · Avg: 92%</Text>
          </View>
          <Icon name="chevron-right" size={24} color={colors.textSecondary} />
        </View>
        <View style={styles.divider} />
        <View style={styles.sessionRow}>
          <Icon name="human" size={24} color={colors.primary} />
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionName}>Push-Up</Text>
            <Text style={styles.sessionMeta}>2 days ago · 3 sets · Avg: 88%</Text>
          </View>
          <Icon name="chevron-right" size={24} color={colors.textSecondary} />
        </View>
      </MotionCard>

      {/* Tips Card */}
      <MotionCard style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <Icon name="lightbulb-outline" size={24} color={colors.accent} />
          <Text style={styles.tipsTitle}>Form Tip</Text>
        </View>
        <Text style={styles.tipsText}>
          Position your phone at hip height, about 6-8 feet away. A side view works best for squats and deadlifts.
        </Text>
      </MotionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  bannerCard: {
    marginBottom: spacing.xl,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.surface,
    paddingTop: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.xl,
  },
  exerciseCard: {
    width: (width - spacing.lg * 2 - spacing.sm * 2) / 2,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  exerciseIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  exerciseMuscle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  difficultyBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  beginnerBadge: {
    backgroundColor: 'rgba(0, 255, 127, 0.2)',
  },
  intermediateBadge: {
    backgroundColor: 'rgba(30, 144, 255, 0.2)',
  },
  advancedBadge: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  sessionInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  sessionMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surface,
    marginVertical: spacing.xs,
  },
  tipsCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  tipsText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  // Camera mode styles
  cameraContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseBadge: {
    flex: 1,
    marginLeft: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radius.md,
  },
  exerciseBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  skeletonHint: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    width: 100,
    height: 150,
    marginLeft: -50,
  },
  jointDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primaryGreen,
    top: 0,
    left: '50%',
    marginLeft: -6,
    ...shadows.glowGreen,
  },
  statsPanel: {
    position: 'absolute',
    top: '40%',
    left: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.surface,
  },
  coachCue: {
    position: 'absolute',
    bottom: 180,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primaryGreen,
  },
  coachCueText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  cameraBottomBar: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  permissionText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});

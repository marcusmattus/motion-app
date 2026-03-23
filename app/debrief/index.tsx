import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MotionButton } from '../../src/components/MotionButton';
import { MotionCard } from '../../src/components/MotionCard';
import { colors, spacing, radius } from '../../src/lib/theme';

export default function DebriefScreen() {
  const router = useRouter();

  const highlights = [
    { label: 'Workouts', value: '3', icon: 'dumbbell' },
    { label: 'Total Time', value: '2h 15m', icon: 'clock-outline' },
    { label: 'Calories', value: '890', icon: 'fire' },
  ];

  const formScores = [
    { exercise: 'Barbell Squat', score: 92, feedback: 'Excellent depth control' },
    { exercise: 'Bench Press', score: 85, feedback: 'Watch elbow flare on heavy sets' },
    { exercise: 'Deadlift', score: 88, feedback: 'Good hip hinge pattern' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Grade Card */}
      <MotionCard variant="glow" style={styles.gradeCard}>
        <Text style={styles.gradeLabel}>OVERALL GRADE</Text>
        <Text style={styles.grade}>A-</Text>
        <Text style={styles.gradeSubtext}>Great week! Keep the momentum going.</Text>
      </MotionCard>

      {/* Highlights */}
      <Text style={styles.sectionTitle}>This Week</Text>
      <View style={styles.highlightsRow}>
        {highlights.map((item) => (
          <MotionCard key={item.label} style={styles.highlightCard} padding="md">
            <Icon name={item.icon} size={24} color={colors.primary} />
            <Text style={styles.highlightValue}>{item.value}</Text>
            <Text style={styles.highlightLabel}>{item.label}</Text>
          </MotionCard>
        ))}
      </View>

      {/* Form Analysis */}
      <Text style={styles.sectionTitle}>Form Analysis</Text>
      <MotionCard>
        {formScores.map((item, index) => (
          <View key={item.exercise}>
            <View style={styles.formRow}>
              <View style={styles.formInfo}>
                <Text style={styles.formExercise}>{item.exercise}</Text>
                <Text style={styles.formFeedback}>{item.feedback}</Text>
              </View>
              <View style={[
                styles.scoreBadge,
                item.score >= 90 && styles.scoreBadgeGood,
                item.score >= 80 && item.score < 90 && styles.scoreBadgeOk,
                item.score < 80 && styles.scoreBadgeWarn,
              ]}>
                <Text style={styles.scoreText}>{item.score}</Text>
              </View>
            </View>
            {index < formScores.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </MotionCard>

      {/* AI Summary */}
      <Text style={styles.sectionTitle}>AI Summary</Text>
      <MotionCard>
        <View style={styles.summaryHeader}>
          <Icon name="robot" size={24} color={colors.primary} />
          <Text style={styles.summaryTitle}>Coach Analysis</Text>
        </View>
        <Text style={styles.summaryText}>
          Your consistency this week was excellent with 3 quality sessions. Form scores improved across all lifts, particularly on squats where depth has been more consistent. Focus on maintaining elbow position during bench press on heavier sets. Consider adding mobility work before deadlifts.
        </Text>
      </MotionCard>

      {/* Action Buttons */}
      <MotionButton
        label="Plan Next Week"
        variant="gradient"
        size="lg"
        fullWidth
        onPress={() => router.push('/(tabs)/today')}
        style={styles.actionButton}
      />
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
  gradeCard: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  gradeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: 2,
  },
  grade: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.primaryGreen,
    marginVertical: spacing.sm,
  },
  gradeSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  highlightsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  highlightCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  highlightValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  highlightLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  formInfo: {
    flex: 1,
  },
  formExercise: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  formFeedback: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scoreBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBadgeGood: {
    backgroundColor: 'rgba(0, 255, 127, 0.2)',
  },
  scoreBadgeOk: {
    backgroundColor: 'rgba(30, 144, 255, 0.2)',
  },
  scoreBadgeWarn: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surface,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  summaryText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  actionButton: {
    marginTop: spacing.xl,
  },
});

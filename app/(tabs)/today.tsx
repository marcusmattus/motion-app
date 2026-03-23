import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MotionCard } from '../../src/components/MotionCard';
import { MotionButton } from '../../src/components/MotionButton';
import { MomentumMeter } from '../../src/components/MomentumMeter';
import { colors, spacing, radius } from '../../src/lib/theme';
import { useMotionStore } from '../../src/state/store';

export default function TodayScreen() {
  const router = useRouter();
  const momentumScore = useMotionStore((s) => s.momentumScore) || 72;

  const quickActions = [
    { id: 'workout', icon: 'dumbbell', label: 'Start Workout', route: '/(tabs)/coach' },
    { id: 'run', icon: 'run', label: 'Go Running', route: '/forge/run' },
    { id: 'progress', icon: 'camera', label: 'Progress Photo', route: '/(tabs)/progress' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Momentum Score Card */}
      <MotionCard variant="glow" style={styles.meterCard}>
        <View style={styles.meterHeader}>
          <Text style={styles.meterTitle}>Momentum Score</Text>
          <Text style={styles.meterDate}>Today</Text>
        </View>
        <View style={styles.meterContainer}>
          <MomentumMeter score={momentumScore} size={180} />
          <View style={styles.meterCenter}>
            <Text style={styles.scoreValue}>{momentumScore}</Text>
            <Text style={styles.scoreLabel}>Keep it up!</Text>
          </View>
        </View>
        <View style={styles.streakRow}>
          <Icon name="fire" size={20} color={colors.accent} />
          <Text style={styles.streakText}>7 day streak</Text>
        </View>
      </MotionCard>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        {quickActions.map((action) => (
          <Pressable
            key={action.id}
            style={styles.actionButton}
            onPress={() => router.push(action.route as any)}
          >
            <View style={styles.actionIcon}>
              <Icon name={action.icon} size={28} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Today's Plan */}
      <Text style={styles.sectionTitle}>Today's Plan</Text>
      <MotionCard style={styles.planCard}>
        <View style={styles.planHeader}>
          <Icon name="lightning-bolt" size={24} color={colors.primaryGreen} />
          <Text style={styles.planTitle}>Upper Body Strength</Text>
        </View>
        <Text style={styles.planDescription}>
          45 min · Push focus · 6 exercises
        </Text>
        <View style={styles.planMeta}>
          <View style={styles.planTag}>
            <Text style={styles.planTagText}>Chest</Text>
          </View>
          <View style={styles.planTag}>
            <Text style={styles.planTagText}>Shoulders</Text>
          </View>
          <View style={styles.planTag}>
            <Text style={styles.planTagText}>Triceps</Text>
          </View>
        </View>
        <MotionButton
          label="Begin Workout"
          variant="primary"
          onPress={() => router.push('/(tabs)/coach')}
          style={styles.planButton}
        />
      </MotionCard>

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <MotionCard>
        <View style={styles.activityRow}>
          <View style={styles.activityIcon}>
            <Icon name="check-circle" size={20} color={colors.primaryGreen} />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Completed Leg Day</Text>
            <Text style={styles.activityMeta}>Yesterday · 52 min · 94 score</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.activityRow}>
          <View style={styles.activityIcon}>
            <Icon name="run" size={20} color={colors.primary} />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Morning Run</Text>
            <Text style={styles.activityMeta}>2 days ago · 5.2 km · 28 min</Text>
          </View>
        </View>
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
  meterCard: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  meterHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  meterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  meterDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  meterContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meterCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.primaryGreen,
    marginTop: spacing.xs,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  streakText: {
    fontSize: 14,
    color: colors.accent,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  planCard: {
    marginBottom: spacing.md,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  planDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  planMeta: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  planTag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
    marginRight: spacing.sm,
  },
  planTagText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  planButton: {
    marginTop: spacing.sm,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  activityMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surface,
    marginVertical: spacing.sm,
  },
});

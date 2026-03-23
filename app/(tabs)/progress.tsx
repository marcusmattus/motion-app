import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Dimensions, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MotionCard } from '../../src/components/MotionCard';
import { MotionButton } from '../../src/components/MotionButton';
import { colors, spacing, radius } from '../../src/lib/theme';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const periods = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: 'all', label: 'All Time' },
  ];

  const stats = [
    { label: 'Workouts', value: '24', change: '+8', icon: 'dumbbell' },
    { label: 'Total Time', value: '18h', change: '+4h', icon: 'clock-outline' },
    { label: 'Avg Score', value: '87', change: '+5', icon: 'star' },
    { label: 'Streak', value: '7', change: 'Best!', icon: 'fire' },
  ];

  const bodyMetrics = [
    { label: 'Weight', value: '75.2 kg', change: '-1.3' },
    { label: 'Body Fat', value: '16.5%', change: '-0.8%' },
    { label: 'Chest', value: '102 cm', change: '+1.5' },
    { label: 'Waist', value: '82 cm', change: '-2.0' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <Pressable
            key={period.id}
            style={[
              styles.periodButton,
              selectedPeriod === period.id && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period.id)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period.id && styles.periodButtonTextActive,
              ]}
            >
              {period.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <MotionCard key={stat.label} style={styles.statCard} padding="md">
            <Icon name={stat.icon} size={24} color={colors.primary} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statChange}>{stat.change}</Text>
          </MotionCard>
        ))}
      </View>

      {/* Progress Photos - The Mirror */}
      <Text style={styles.sectionTitle}>The Mirror</Text>
      <MotionCard style={styles.mirrorCard}>
        <View style={styles.photosContainer}>
          <View style={[styles.photoPlaceholder, { opacity: 1 - overlayOpacity }]}>
            <Icon name="account" size={48} color={colors.textMuted} />
            <Text style={styles.photoLabel}>Current</Text>
          </View>
          <View style={[styles.photoPlaceholder, { opacity: overlayOpacity }]}>
            <Icon name="account-clock" size={48} color={colors.textMuted} />
            <Text style={styles.photoLabel}>30 Days Ago</Text>
          </View>
        </View>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Overlay</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={overlayOpacity}
            onValueChange={setOverlayOpacity}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.surface}
            thumbTintColor={colors.primary}
          />
        </View>
        <MotionButton
          label="Take Progress Photo"
          variant="secondary"
          icon={<Icon name="camera" size={20} color={colors.primary} />}
        />
      </MotionCard>

      {/* Body Metrics */}
      <Text style={styles.sectionTitle}>Body Metrics</Text>
      <MotionCard>
        {bodyMetrics.map((metric, index) => (
          <View key={metric.label}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <View style={styles.metricValues}>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text
                  style={[
                    styles.metricChange,
                    metric.change.startsWith('-') && styles.metricChangeNegative,
                    metric.change.startsWith('+') && styles.metricChangePositive,
                  ]}
                >
                  {metric.change}
                </Text>
              </View>
            </View>
            {index < bodyMetrics.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
        <MotionButton
          label="Update Measurements"
          variant="ghost"
          size="sm"
          style={styles.updateButton}
        />
      </MotionCard>

      {/* Momentum Chart Placeholder */}
      <Text style={styles.sectionTitle}>Momentum History</Text>
      <MotionCard style={styles.chartCard}>
        <View style={styles.chartPlaceholder}>
          <Icon name="chart-line" size={48} color={colors.textMuted} />
          <Text style={styles.chartPlaceholderText}>
            Score trend over {selectedPeriod === '7d' ? '7 days' : selectedPeriod === '30d' ? '30 days' : selectedPeriod === '90d' ? '90 days' : 'all time'}
          </Text>
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: colors.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: (width - spacing.lg * 2 - spacing.sm * 2) / 2,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statChange: {
    fontSize: 12,
    color: colors.primaryGreen,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  mirrorCard: {
    marginBottom: spacing.lg,
  },
  photosContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  photoPlaceholder: {
    flex: 1,
    height: 200,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  sliderContainer: {
    marginBottom: spacing.md,
  },
  sliderLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  metricLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  metricValues: {
    alignItems: 'flex-end',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  metricChange: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  metricChangePositive: {
    color: colors.primaryGreen,
  },
  metricChangeNegative: {
    color: colors.danger,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surface,
  },
  updateButton: {
    marginTop: spacing.md,
    alignSelf: 'center',
  },
  chartCard: {
    marginBottom: spacing.lg,
  },
  chartPlaceholder: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});

import { useRouter } from 'expo-router';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MotionButton } from '../../src/components/MotionButton';
import { MotionCard } from '../../src/components/MotionCard';
import { colors, spacing, radius } from '../../src/lib/theme';

export default function ForgeIndex() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Workout Modes</Text>

      {/* HIIT / Running Card */}
      <MotionCard style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Icon name="run-fast" size={32} color={colors.primary} />
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>GPS Running</Text>
            <Text style={styles.cardSubtitle}>Outdoor runs with tracking</Text>
          </View>
        </View>
        <Text style={styles.cardBody}>
          Track your outdoor runs with GPS, monitor pace, distance, and route. 
          Perfect for cardio sessions and trail running.
        </Text>
        <View style={styles.featureTags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>GPS Tracking</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Pace Monitor</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Route Map</Text>
          </View>
        </View>
        <MotionButton
          label="Start Run"
          variant="gradient"
          icon={<Icon name="play" size={20} color={colors.charcoal} />}
          onPress={() => router.push('/forge/run')}
        />
      </MotionCard>

      {/* Strength Training Card */}
      <MotionCard style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Icon name="dumbbell" size={32} color={colors.primaryGreen} />
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>Form Tracking</Text>
            <Text style={styles.cardSubtitle}>AI-powered pose analysis</Text>
          </View>
        </View>
        <Text style={styles.cardBody}>
          Real-time form feedback with pose tracking. Count reps automatically 
          and get coaching cues for better technique.
        </Text>
        <View style={styles.featureTags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Pose Detection</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Rep Counter</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Form Score</Text>
          </View>
        </View>
        <MotionButton
          label="Active Motion"
          variant="primary"
          icon={<Icon name="camera" size={20} color={colors.textPrimary} />}
          onPress={() => router.push('/forge/camera')}
        />
      </MotionCard>

      {/* Quick tip */}
      <MotionCard style={styles.tipCard}>
        <View style={styles.tipHeader}>
          <Icon name="lightbulb-outline" size={20} color={colors.accent} />
          <Text style={styles.tipTitle}>Pro Tip</Text>
        </View>
        <Text style={styles.tipText}>
          Use the AI Coach tab for full exercise selection with detailed form rules 
          and personalized feedback.
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardBody: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  featureTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  tagText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tipCard: {
    backgroundColor: colors.surface,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  tipText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

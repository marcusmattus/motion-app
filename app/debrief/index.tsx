import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Share } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '../../src/lib/theme';
import { TerminalCard } from '../../src/components/TerminalCard';
import { TerminalText } from '../../src/components/TerminalText';
import { useMotionStore } from '../../src/state/store';

function formatDuration(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const m = String(Math.floor(totalSecs / 60)).padStart(2, '0');
  const s = String(totalSecs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function DebriefScreen() {
  const router = useRouter();
  const { sessions, liveSets, liveFormScore, liveSymmetryScore } = useMotionStore();

  // Use the most recent session, or fall back to live data
  const session = sessions[0];
  const sets = session?.sets ?? liveSets;
  const totalReps = session?.totalReps ?? sets.reduce((s, st) => s + st.reps, 0);
  const avgForm = session?.avgFormScore ?? liveFormScore;
  const symScore = session?.symmetryScore ?? liveSymmetryScore;
  const duration = session
    ? formatDuration((session.endTime ?? Date.now()) - session.startTime)
    : '--:--';
  const exerciseId = session?.exerciseId ?? 'SQUAT';
  const bestSet = sets.reduce<typeof sets[number] | null>((best, st) =>
    !best || st.formScore > best.formScore ? st : best, null);

  const formColor = (score: number) =>
    score >= 80 ? colors.terminalGreen : score >= 55 ? colors.terminalAmber : colors.danger;

  const recommendation =
    symScore < 85
      ? 'Increase weaker side activation — notable L/R imbalance detected'
      : avgForm < 70
      ? 'Reposition camera for better joint visibility next session'
      : avgForm < 85
      ? 'Focus on depth and range of motion consistency'
      : 'Excellent session — maintain current form patterns';

  const shareText = `> SESSION COMPLETE ✓
> DURATION: ${duration}
> EXERCISE: ${exerciseId}
> TOTAL REPS: ${totalReps}
> AVG FORM: ${avgForm}%
> SYMMETRY: ${symScore}%
> RECOMMENDATION: ${recommendation}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Terminal printout header */}
      <TerminalCard title="SESSION_COMPLETE" variant="glow" style={styles.card}>
        <TerminalText mono prefix=">" color={colors.terminalGreen} style={styles.logLine}>
          SESSION COMPLETE ✓
        </TerminalText>
        <TerminalText mono prefix=">" color={colors.textSecondary} style={styles.logLine}>
          {`DURATION: ${duration}`}
        </TerminalText>
        <TerminalText mono prefix=">" color={colors.textSecondary} style={styles.logLine}>
          {`EXERCISE: ${exerciseId}`}
        </TerminalText>
        <TerminalText mono prefix=">" color={colors.textSecondary} style={styles.logLine}>
          {`TOTAL_REPS: ${totalReps}`}
        </TerminalText>
        <TerminalText
          mono
          prefix=">"
          color={formColor(avgForm)}
          style={styles.logLine}
        >
          {`AVG_FORM: ${avgForm}%`}
        </TerminalText>
        {bestSet && (
          <TerminalText mono prefix=">" color={colors.terminalGreen} style={styles.logLine}>
            {`BEST_SET: SET_${String(bestSet.setNumber).padStart(2, '0')} (${bestSet.formScore}% form)`}
          </TerminalText>
        )}
        <TerminalText
          mono
          prefix=">"
          color={symScore >= 85 ? colors.terminalGreen : colors.terminalAmber}
          style={styles.logLine}
        >
          {`SYMMETRY: ${symScore}%`}
        </TerminalText>
        <TerminalText mono prefix=">" color={colors.terminalAmber} style={styles.logLine}>
          {`RECOMMENDATION: ${recommendation}`}
        </TerminalText>
      </TerminalCard>

      {/* Set log */}
      {sets.length > 0 && (
        <TerminalCard title="SET_LOG" style={styles.card}>
          {sets.map((st, i) => (
            <View key={i} style={styles.setRow}>
              <Text style={styles.setKey}>{`SET_${String(st.setNumber).padStart(2, '0')}`}</Text>
              <Text style={styles.setSep}>|</Text>
              <Text style={styles.setVal}>{st.reps} reps</Text>
              <Text style={styles.setSep}>|</Text>
              <Text style={[styles.setVal, { color: formColor(st.formScore) }]}>
                {st.formScore}% form
              </Text>
              <Text style={styles.setSep}>|</Text>
              <Text style={styles.setVal}>
                {st.avgTempo > 0 ? `${st.avgTempo.toFixed(1)}s tempo` : '--'}
              </Text>
            </View>
          ))}
        </TerminalCard>
      )}

      {/* Score breakdown */}
      <TerminalCard title="SCORE_BREAKDOWN" style={styles.card}>
        <View style={styles.scoreRow}>
          <View style={styles.scoreItem}>
            <Text style={[styles.scoreValue, { color: formColor(avgForm) }]}>{avgForm}%</Text>
            <Text style={styles.scoreLabel}>[FORM]</Text>
          </View>
          <View style={styles.scoreDivider} />
          <View style={styles.scoreItem}>
            <Text style={[styles.scoreValue, { color: symScore >= 85 ? colors.terminalGreen : colors.terminalAmber }]}>
              {symScore}%
            </Text>
            <Text style={styles.scoreLabel}>[SYMMETRY]</Text>
          </View>
          <View style={styles.scoreDivider} />
          <View style={styles.scoreItem}>
            <Text style={styles.scoreValue}>{totalReps}</Text>
            <Text style={styles.scoreLabel}>[REPS]</Text>
          </View>
        </View>
      </TerminalCard>

      {/* Action buttons */}
      <Pressable
        style={styles.actionBtn}
        onPress={() => Share.share({ message: shareText })}
      >
        <Text style={styles.actionBtnText}>{`> SHARE_RESULTS`}</Text>
      </Pressable>

      <Pressable
        style={[styles.actionBtn, styles.actionBtnGreen]}
        onPress={() => router.push('/forge/session' as any)}
      >
        <Text style={[styles.actionBtnText, { color: colors.terminalGreen }]}>
          {`> NEW_SESSION`}
        </Text>
      </Pressable>

      <Pressable
        style={styles.actionBtnGhost}
        onPress={() => router.push('/(tabs)/analytics' as any)}
      >
        <Text style={styles.actionBtnGhostText}>{`> VIEW_ANALYTICS`}</Text>
      </Pressable>
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
  card: {
    marginBottom: spacing.md,
  },
  logLine: {
    fontSize: 12,
    marginBottom: spacing.xs + 2,
    lineHeight: 20,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    flexWrap: 'wrap',
    gap: 4,
  },
  setKey: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: colors.textMuted,
    minWidth: 52,
  },
  setSep: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: colors.terminalBorder,
  },
  setVal: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: colors.textSecondary,
    minWidth: 60,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreValue: {
    fontFamily: 'SpaceMono',
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.terminalGreen,
  },
  scoreLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
    letterSpacing: 1,
  },
  scoreDivider: {
    width: 1,
    height: 48,
    backgroundColor: colors.terminalBorder,
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: colors.terminalBorder,
    borderStyle: 'dashed',
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: 4,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
  },
  actionBtnGreen: {
    borderColor: colors.terminalGreen,
    backgroundColor: 'rgba(0,255,65,0.08)',
  },
  actionBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: 2,
  },
  actionBtnGhost: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  actionBtnGhostText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
  },
});


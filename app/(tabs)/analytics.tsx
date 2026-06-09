import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
  Alert,
} from 'react-native';
import Svg, {
  Rect,
  Line,
  Path,
  Text as SvgText,
  Circle,
  G,
} from 'react-native-svg';
import { colors, spacing } from '../../src/lib/theme';
import { TerminalCard } from '../../src/components/TerminalCard';
import { TerminalText } from '../../src/components/TerminalText';
import { useMotionStore } from '../../src/state/store';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_W = SCREEN_W - spacing.lg * 2 - spacing.lg * 2;
const CHART_H = 120;

const PERIODS = ['TODAY', 'WEEK', 'MONTH', 'ALL'];

// Mock data generators
function mockVolumeData() {
  return ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => ({
    day: d,
    kg: Math.floor(Math.random() * 3000) + 500,
  }));
}

function mockFormTrend() {
  return Array.from({ length: 7 }, (_, i) => ({
    session: i + 1,
    form: 60 + Math.floor(Math.random() * 35),
  }));
}

function mockSymmetry() {
  return [
    { session: 'MON', left: 88, right: 84 },
    { session: 'WED', left: 90, right: 87 },
    { session: 'FRI', left: 86, right: 91 },
    { session: 'SAT', left: 92, right: 90 },
  ];
}

export default function AnalyticsTab() {
  const [period, setPeriod] = useState('WEEK');
  const { sessions, liveReps, liveFormScore, liveSymmetryScore } = useMotionStore();

  // Memoize mock chart data so it doesn't regenerate on every render
  const volumeData = useMemo(() => mockVolumeData(), [period]);
  const formTrend = useMemo(() => mockFormTrend(), [period]);
  const symmetryData = useMemo(() => mockSymmetry(), [period]);

  const maxVolume = Math.max(...volumeData.map((d) => d.kg));
  const totalReps = sessions.reduce((s, ses) => s + ses.totalReps, 0) + liveReps;
  const avgForm =
    sessions.length > 0
      ? Math.round(sessions.reduce((s, ses) => s + ses.avgFormScore, 0) / sessions.length)
      : liveFormScore;
  const avgSym =
    sessions.length > 0
      ? Math.round(sessions.reduce((s, ses) => s + ses.symmetryScore, 0) / sessions.length)
      : liveSymmetryScore;

  const formColor = (score: number) =>
    score >= 80 ? colors.terminalGreen : score >= 55 ? colors.terminalAmber : colors.danger;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Period selector */}
      <View style={styles.periodRow}>
        {PERIODS.map((p) => (
          <Pressable
            key={p}
            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodBtnText, period === p && styles.periodBtnTextActive]}>
              [{p}]
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Summary stats */}
      <TerminalCard title="SUMMARY" style={styles.card}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{sessions.length}</Text>
            <Text style={styles.summaryLabel}>[SESSIONS]</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalReps}</Text>
            <Text style={styles.summaryLabel}>[TOTAL REPS]</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: formColor(avgForm) }]}>{avgForm}%</Text>
            <Text style={styles.summaryLabel}>[AVG FORM]</Text>
          </View>
        </View>
      </TerminalCard>

      {/* Volume chart */}
      <TerminalCard title="VOLUME LOAD KG" style={styles.card}>
        <Svg width={CHART_W} height={CHART_H + 24}>
          {volumeData.map((d, i) => {
            const barW = CHART_W / volumeData.length - 8;
            const barH = (d.kg / maxVolume) * CHART_H;
            const x = i * (CHART_W / volumeData.length) + 4;
            const y = CHART_H - barH;
            return (
              <G key={i}>
                <Rect x={x} y={y} width={barW} height={barH} fill={colors.terminalGreen} opacity={0.7} rx={2} />
                <SvgText x={x + barW / 2} y={CHART_H + 14} fill={colors.textMuted} fontSize={9} textAnchor="middle" fontFamily="SpaceMono">
                  {d.day}
                </SvgText>
              </G>
            );
          })}
          {/* Baseline */}
          <Line x1={0} y1={CHART_H} x2={CHART_W} y2={CHART_H} stroke={colors.terminalBorder} strokeWidth={1} />
        </Svg>
      </TerminalCard>

      {/* Form trend */}
      <TerminalCard title="FORM TREND %" style={styles.card}>
        <Svg width={CHART_W} height={CHART_H + 24}>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <Line
              key={f}
              x1={0}
              y1={CHART_H * (1 - f)}
              x2={CHART_W}
              y2={CHART_H * (1 - f)}
              stroke={colors.terminalBorder}
              strokeWidth={0.5}
              strokeDasharray="4,4"
            />
          ))}
          {/* Line path */}
          <Path
            d={formTrend
              .map((pt, i) => {
                const x = (i / (formTrend.length - 1)) * CHART_W;
                const y = CHART_H * (1 - pt.form / 100);
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              })
              .join(' ')}
            stroke={colors.terminalBlue}
            strokeWidth={2}
            fill="none"
          />
          {formTrend.map((pt, i) => {
            const x = (i / (formTrend.length - 1)) * CHART_W;
            const y = CHART_H * (1 - pt.form / 100);
            return <Circle key={i} cx={x} cy={y} r={3} fill={colors.terminalBlue} />;
          })}
          <Line x1={0} y1={CHART_H} x2={CHART_W} y2={CHART_H} stroke={colors.terminalBorder} strokeWidth={1} />
        </Svg>
      </TerminalCard>

      {/* Symmetry log */}
      <TerminalCard title="SYMMETRY L/R" style={styles.card}>
        {symmetryData.map((row, i) => (
          <View key={i} style={styles.symmetryRow}>
            <Text style={styles.symmetrySession}>{row.session}</Text>
            <View style={styles.symBarContainer}>
              <View style={[styles.symBar, { flex: row.left, backgroundColor: colors.terminalBlue }]} />
              <Text style={styles.symLabel}>{row.left}%</Text>
            </View>
            <Text style={styles.symSep}>|</Text>
            <View style={styles.symBarContainer}>
              <Text style={styles.symLabel}>{row.right}%</Text>
              <View style={[styles.symBar, { flex: row.right, backgroundColor: colors.terminalGreen }]} />
            </View>
          </View>
        ))}
        <View style={styles.symLegend}>
          <View style={[styles.symDot, { backgroundColor: colors.terminalBlue }]} />
          <Text style={styles.symLegendText}>LEFT</Text>
          <View style={[styles.symDot, { backgroundColor: colors.terminalGreen, marginLeft: spacing.md }]} />
          <Text style={styles.symLegendText}>RIGHT</Text>
        </View>
      </TerminalCard>

      {/* Body heat map placeholder */}
      <TerminalCard title="MUSCLE ACTIVATION MAP" style={styles.card}>
        <View style={styles.heatmapPlaceholder}>
          <Svg width={120} height={200}>
            {/* Body silhouette */}
            <Circle cx={60} cy={22} r={18} fill={colors.surface} stroke={colors.terminalBorder} strokeWidth={1} />
            <Rect x={38} y={42} width={44} height={65} rx={8} fill={colors.surface} stroke={colors.terminalBorder} strokeWidth={1} />
            <Rect x={18} y={44} width={18} height={55} rx={6} fill={colors.terminalAmber} opacity={0.5} />
            <Rect x={84} y={44} width={18} height={55} rx={6} fill={colors.terminalGreen} opacity={0.5} />
            <Rect x={38} y={109} width={18} height={65} rx={6} fill={colors.terminalGreen} opacity={0.6} />
            <Rect x={64} y={109} width={18} height={65} rx={6} fill={colors.terminalBlue} opacity={0.6} />
          </Svg>
          <View style={styles.heatmapLegend}>
            <TerminalText mono style={{ fontSize: 10 }} color={colors.terminalGreen}>HIGH ACTIVATION</TerminalText>
            <TerminalText mono style={{ fontSize: 10 }} color={colors.terminalAmber}>MODERATE</TerminalText>
            <TerminalText mono style={{ fontSize: 10 }} color={colors.textMuted}>LOW</TerminalText>
          </View>
        </View>
      </TerminalCard>

      {/* Export button */}
      <Pressable
        style={styles.exportBtn}
        onPress={() => Alert.alert('[DATA_EXPORT]', 'Export will be prepared and available for download.')}
      >
        <Text style={styles.exportBtnText}>{`> EXPORT_DATA.CSV`}</Text>
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
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  periodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: colors.terminalBorder,
    borderRadius: 3,
    backgroundColor: colors.card,
  },
  periodBtnActive: {
    borderColor: colors.terminalGreen,
    backgroundColor: 'rgba(0,255,65,0.08)',
  },
  periodBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  periodBtnTextActive: {
    color: colors.terminalGreen,
  },
  card: {
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontFamily: 'SpaceMono',
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.terminalGreen,
  },
  summaryLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
    letterSpacing: 1,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.terminalBorder,
  },
  symmetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  symmetrySession: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: colors.textMuted,
    width: 32,
    letterSpacing: 1,
  },
  symBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  symBar: {
    height: 8,
    borderRadius: 2,
    maxWidth: 60,
  },
  symLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: colors.textSecondary,
    minWidth: 28,
    textAlign: 'center',
  },
  symSep: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: colors.terminalBorder,
    marginHorizontal: spacing.xs,
  },
  symLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  symDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  symLegendText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  heatmapPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
  },
  heatmapLegend: {
    gap: spacing.sm,
  },
  exportBtn: {
    borderWidth: 1,
    borderColor: colors.terminalBorder,
    borderStyle: 'dashed',
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: 4,
    marginTop: spacing.sm,
    backgroundColor: colors.card,
  },
  exportBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: 2,
  },
});

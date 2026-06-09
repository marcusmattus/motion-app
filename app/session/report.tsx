// app/session/report.tsx
// Post-session debrief. Pure analytics (offline) + an AI debrief (spoken). Reads
// the summary aloud on arrival; if the backend is down, a deterministic local
// report fills in so the screen is never empty.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '../../src/state/sessionStore';
import { buildSummary } from '../../src/session/analytics';
import { fetchReport, localReport, SessionReport } from '../../src/session/reportClient';
import { FormChart } from '../../src/components/tracking/FormChart';
import {
  TerminalCard, TerminalButton, Metric, Scanlines, Cursor,
} from '../../src/components/terminal';
import { semantic, font, space, type } from '../../src/lib/terminalTheme';
import { say, shutUp } from '../../src/voice/speech';

const REPORT_ENDPOINT = process.env.EXPO_PUBLIC_REPORT_ENDPOINT;

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ReportScreen() {
  const router = useRouter();
  const store = useSession();

  // Snapshot the summary once on mount — the screen is a frozen debrief.
  const summary = useMemo(
    () =>
      buildSummary({
        exercise: store.exercise,
        reps: store.reps,
        cueTally: store.cueTally,
        durationSec: store.durationSec(),
        avgForm: store.avgForm(),
        consistency: store.consistency(),
        history: store.history,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [report, setReport] = useState<SessionReport>(() => localReport(summary));
  const [loading, setLoading] = useState(true);
  const spokenRef = useRef(false);

  useEffect(() => {
    let alive = true;
    fetchReport(REPORT_ENDPOINT, summary).then((r) => {
      if (!alive) return;
      setReport(r);
      setLoading(false);
      if (!spokenRef.current) {
        spokenRef.current = true;
        say(r.summary, 'normal');
      }
    });
    return () => { alive = false; shutUp(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fatigueTone = summary.fatiguePer10 <= -8 ? semantic.bad
    : summary.fatiguePer10 < 0 ? semantic.warn : semantic.good;
  const deltaTone = summary.deltaVsLast == null ? semantic.textDim
    : summary.deltaVsLast >= 0 ? semantic.good : semantic.bad;

  const newSet = () => {
    shutUp();
    store.reset();
    router.replace('/session/live');
  };
  const done = () => { shutUp(); router.replace('/'); };

  return (
    <View style={styles.root}>
      <Scanlines />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={type.label(semantic.accent)}>DEBRIEF</Text>
          <Text style={styles.title}>
            {summary.exerciseLabel.toUpperCase()}<Cursor />
          </Text>
        </View>

        {/* AI debrief */}
        <TerminalCard accent={semantic.accent}>
          <Text style={type.label()}>FORMA</Text>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={semantic.accent} />
              <Text style={styles.loadingText}>analyzing set…</Text>
            </View>
          ) : (
            <Text style={styles.summaryText}>{report.summary}</Text>
          )}
          {report.source === 'local' && !loading ? (
            <Text style={styles.offlineNote}>offline report · backend unreachable</Text>
          ) : null}
        </TerminalCard>

        {/* metrics */}
        <TerminalCard>
          <View style={styles.metricRow}>
            <Metric label="REPS" value={summary.reps} />
            <Metric label="AVG FORM" value={summary.avgForm} unit="%" tone={semantic.good} />
            <Metric label="DURATION" value={fmtDuration(summary.durationSec)} />
          </View>
          <View style={styles.metricRow}>
            <Metric label="CONSISTENCY" value={summary.consistency} unit="%" />
            <Metric
              label="FATIGUE /10"
              value={summary.fatiguePer10 > 0 ? `+${summary.fatiguePer10}` : summary.fatiguePer10}
              tone={fatigueTone}
            />
            <Metric
              label="VS LAST"
              value={summary.deltaVsLast == null ? '—'
                : `${summary.deltaVsLast >= 0 ? '+' : ''}${summary.deltaVsLast}%`}
              tone={deltaTone}
            />
          </View>
          {summary.bestRep && summary.worstRep ? (
            <Text style={styles.bestWorst}>
              best rep #{summary.bestRep} · worst rep #{summary.worstRep}
            </Text>
          ) : null}
        </TerminalCard>

        {/* chart */}
        <TerminalCard>
          <Text style={type.label()}>FORM PER REP</Text>
          <View style={styles.chartWrap}>
            <FormChart reps={summary.reps >= 2 ? store.reps : []} trend={summary.trend} />
          </View>
        </TerminalCard>

        {/* top issues */}
        {summary.topIssues.length > 0 ? (
          <TerminalCard accent={semantic.warn}>
            <Text style={type.label(semantic.warn)}>TOP ISSUES</Text>
            {summary.topIssues.map((issue) => (
              <View key={issue.id} style={styles.issueRow}>
                <Text style={styles.issueText}>{issue.text}</Text>
                <Text style={styles.issueCount}>{issue.count}/{issue.totalReps}</Text>
              </View>
            ))}
          </TerminalCard>
        ) : null}

        {/* drills */}
        <TerminalCard>
          <Text style={type.label()}>DRILLS</Text>
          {report.drills.map((d, i) => (
            <Text key={i} style={styles.drill}>{`> ${d}`}</Text>
          ))}
        </TerminalCard>

        {/* next target */}
        <TerminalCard accent={semantic.accent}>
          <Text style={type.label(semantic.accent)}>NEXT SESSION</Text>
          <Text style={styles.summaryText}>{report.nextTarget}</Text>
        </TerminalCard>

        <TerminalButton label="new set" onPress={newSet} />
        <TerminalButton label="done" tone="warn" onPress={done} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: semantic.bg },
  content: { padding: space(4), paddingTop: space(12), paddingBottom: space(10) },
  header: { marginBottom: space(4) },
  title: { fontFamily: font.heading, fontSize: 30, color: semantic.text, letterSpacing: 2 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: space(2) },
  summaryText: { ...type.mono(15), lineHeight: 22, marginTop: space(2) },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: space(2), marginTop: space(2) },
  loadingText: { ...type.mono(13, semantic.textDim) },
  offlineNote: { fontFamily: font.alt, fontSize: 10, color: semantic.textDim, marginTop: space(2), letterSpacing: 1 },
  bestWorst: { ...type.mono(12, semantic.textDim), marginTop: space(2) },
  chartWrap: { marginTop: space(3), alignItems: 'center' },
  issueRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space(2) },
  issueText: { ...type.mono(14, semantic.text) },
  issueCount: { ...type.mono(14, semantic.warn) },
  drill: { ...type.mono(14), lineHeight: 22, marginTop: space(2) },
});

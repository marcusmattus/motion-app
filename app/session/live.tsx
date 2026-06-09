// app/session/live.tsx
// Live tracking screen. In a dev build this hosts the Vision Camera + pose
// stream and feeds frames to `useVoiceCoach().onFrame(pose)`. Ending the set
// snapshots history and routes into the post-session report.
//
// The camera/pose pipeline is native (see README); here we own the session
// lifecycle and the route into the debrief. A __DEV__-only "simulate rep" hook
// lets the report screen be exercised without a device.

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '../../src/state/sessionStore';
import { useVoiceCoach } from '../../src/voice/useVoiceCoach';
import { EXERCISES } from '../../src/vision/poseRules';
import {
  TerminalCard, TerminalButton, Metric, Scanlines, Cursor,
} from '../../src/components/terminal';
import { semantic, font, space, type } from '../../src/lib/terminalTheme';

export default function LiveScreen() {
  const router = useRouter();
  const store = useSession();
  // onFrame is wired to the native pose stream in a dev build.
  useVoiceCoach();

  // Start a fresh set on entry.
  useEffect(() => {
    if (!store.active) store.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const endSet = () => {
    store.stop();
    router.replace('/session/report');
  };

  // Dev-only: synthesize a fatiguing rep so the debrief has data off-device.
  const simulateRep = () => {
    const i = store.reps.length;
    const score = Math.max(55, 92 - i * 3); // declining set
    store.pushRep(score);
    const cues: { id: string; text: string; severity: string }[] = [];
    if (score < 85) cues.push({ id: 'depth', text: 'go deeper', severity: 'warn' });
    if (score < 70) cues.push({ id: 'back', text: 'flatten your back', severity: 'critical' });
    if (cues.length) store.logRepCues(cues);
  };

  return (
    <View style={styles.root}>
      <Scanlines />
      <View style={styles.content}>
        <Text style={type.label(semantic.accent)}>LIVE · TRACKING</Text>
        <Text style={styles.title}>
          {EXERCISES[store.exercise].label.toUpperCase()}<Cursor />
        </Text>

        <TerminalCard>
          <View style={styles.row}>
            <Metric label="REPS" value={store.reps.length} />
            <Metric label="FORM" value={store.avgForm()} unit="%" tone={semantic.good} />
            <Metric label="LIVE" value={store.currentFormScore} unit="%" />
          </View>
        </TerminalCard>

        {__DEV__ ? <TerminalButton label="simulate rep (dev)" onPress={simulateRep} /> : null}
        <TerminalButton label="end set" tone="warn" onPress={endSet} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: semantic.bg },
  content: { flex: 1, padding: space(4), paddingTop: space(14), justifyContent: 'center' },
  title: { fontFamily: font.heading, fontSize: 30, color: semantic.text, letterSpacing: 2, marginBottom: space(4) },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
});

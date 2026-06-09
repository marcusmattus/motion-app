// src/components/terminal/index.tsx
// Terminal-aesthetic primitives: TerminalCard / Button / Metric / Scanlines / Cursor.
// Thin glowing borders, monospace, neon-on-navy. Screens compose these so they
// never hardcode hex or re-derive the glow treatment.

import React, { useEffect, useRef } from 'react';
import {
  Animated, Pressable, StyleSheet, Text, View, ViewStyle, TextStyle,
} from 'react-native';
import { semantic, colors, glow, radius, space, type, font } from '../../lib/terminalTheme';

export function TerminalCard({
  children, accent = semantic.accent, style,
}: { children: React.ReactNode; accent?: string; style?: ViewStyle }) {
  return (
    <View style={[styles.card, glow(accent, 0.25, 12), style]}>
      {children}
    </View>
  );
}

export function TerminalButton({
  label, onPress, tone = 'accent',
}: { label: string; onPress: () => void; tone?: 'accent' | 'warn' | 'bad' }) {
  const color = tone === 'warn' ? semantic.warn : tone === 'bad' ? semantic.bad : semantic.accent;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        glow(color, pressed ? 0.5 : 0.3, 10),
        { backgroundColor: pressed ? 'rgba(255,255,255,0.04)' : 'transparent' },
      ]}
    >
      <Text style={[styles.buttonText, { color }]}>{`> ${label}`}</Text>
    </Pressable>
  );
}

export function Metric({
  label, value, unit, tone = semantic.text,
}: { label: string; value: string | number; unit?: string; tone?: string }) {
  return (
    <View style={styles.metric}>
      <Text style={type.label()}>{label}</Text>
      <Text style={styles.metricValue}>
        <Text style={{ color: tone }}>{value}</Text>
        {unit ? <Text style={styles.metricUnit}>{` ${unit}`}</Text> : null}
      </Text>
    </View>
  );
}

/** Faint horizontal scanlines overlay — purely decorative, non-interactive. */
export function Scanlines() {
  const lines = Array.from({ length: 60 });
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {lines.map((_, i) => (
        <View key={i} style={[styles.scanline, { top: i * 8 }]} />
      ))}
    </View>
  );
}

/** Blinking block cursor for the terminal feel. */
export function Cursor({ color = semantic.accent }: { color?: string }) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.Text style={[styles.cursor, { color, opacity }]}>▍</Animated.Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: semantic.surface,
    borderRadius: radius.md,
    padding: space(4),
    marginBottom: space(3),
  },
  button: {
    borderRadius: radius.sm,
    paddingVertical: space(3),
    paddingHorizontal: space(4),
    alignItems: 'center',
    marginTop: space(2),
  },
  buttonText: {
    fontFamily: font.body,
    fontSize: 15,
    letterSpacing: 1,
  } as TextStyle,
  metric: { minWidth: 84, marginBottom: space(2) },
  metricValue: { fontFamily: font.heading, fontSize: 26, marginTop: space(1) },
  metricUnit: { fontFamily: font.alt, fontSize: 12, color: semantic.textDim },
  scanline: {
    position: 'absolute', left: 0, right: 0, height: 1,
    backgroundColor: colors.scanline,
  },
  cursor: { fontFamily: font.body, fontSize: 16 },
});

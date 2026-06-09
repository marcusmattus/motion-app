// src/components/tracking/FormChart.tsx
// Form-per-rep line chart, drawn with Skia — no chart dependency. A dashed
// least-squares overlay makes the fatigue trend visible at a glance.
// Terminal-styled: neon line on navy, faint gridlines.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Canvas, Path, Circle, Line, Skia, DashPathEffect, vec,
} from '@shopify/react-native-skia';
import { RepRecord } from '../../state/sessionStore';
import { TrendLine } from '../../session/analytics';
import { colors, semantic, font, space } from '../../lib/terminalTheme';

const PAD = 14;

export function FormChart({
  reps, trend, width = 320, height = 160,
}: { reps: RepRecord[]; trend: TrendLine; width?: number; height?: number }) {
  if (reps.length < 2) {
    return (
      <View style={[styles.empty, { width, height }]}>
        <Text style={styles.emptyText}>not enough reps to chart</Text>
      </View>
    );
  }

  const n = reps.length;
  const innerW = width - PAD * 2;
  const innerH = height - PAD * 2;

  // x maps rep index 1..n; y maps form 0..100 (inverted for screen space).
  const xAt = (i: number) => PAD + ((i - 1) / (n - 1)) * innerW;
  const yAt = (score: number) => PAD + (1 - Math.min(100, Math.max(0, score)) / 100) * innerH;

  // Form polyline.
  const line = Skia.Path.Make();
  reps.forEach((r, idx) => {
    const x = xAt(r.index);
    const y = yAt(r.formScore);
    if (idx === 0) line.moveTo(x, y);
    else line.lineTo(x, y);
  });

  // Dashed regression overlay across the full rep range.
  const trendStart = vec(xAt(1), yAt(trend.intercept + trend.slope * 1));
  const trendEnd = vec(xAt(n), yAt(trend.intercept + trend.slope * n));

  // Horizontal gridlines at 50 / 75 / 100.
  const grids = [50, 75, 100];

  return (
    <View style={{ width, height }}>
      <Canvas style={{ width, height }}>
        {grids.map((g) => (
          <Line
            key={g}
            p1={vec(PAD, yAt(g))}
            p2={vec(width - PAD, yAt(g))}
            color={colors.grid}
            strokeWidth={1}
          />
        ))}

        {/* fatigue trend */}
        <Line p1={trendStart} p2={trendEnd} color={semantic.warn} strokeWidth={1.5}>
          <DashPathEffect intervals={[6, 5]} />
        </Line>

        {/* form line */}
        <Path path={line} style="stroke" strokeWidth={2} color={semantic.accent} />

        {/* rep markers */}
        {reps.map((r) => (
          <Circle key={r.index} cx={xAt(r.index)} cy={yAt(r.formScore)} r={3} color={semantic.accent} />
        ))}
      </Canvas>
      <View style={styles.legend}>
        <Text style={styles.legendForm}>— form</Text>
        <Text style={styles.legendTrend}>- - fatigue trend</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: font.alt, fontSize: 11, color: semantic.textDim, letterSpacing: 1 },
  legend: { flexDirection: 'row', justifyContent: 'flex-end', gap: space(3), marginTop: space(1) },
  legendForm: { fontFamily: font.alt, fontSize: 10, color: semantic.accent, letterSpacing: 1 },
  legendTrend: { fontFamily: font.alt, fontSize: 10, color: semantic.warn, letterSpacing: 1 },
});

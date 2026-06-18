import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../lib/theme';

type TerminalCardProps = {
  children: React.ReactNode;
  title?: string;
  variant?: 'default' | 'glow' | 'danger' | 'amber';
  style?: ViewStyle;
  padding?: number;
};

export function TerminalCard({
  children,
  title,
  variant = 'default',
  style,
  padding = spacing.lg,
}: TerminalCardProps) {
  const borderColor =
    variant === 'glow'
      ? colors.terminalGreen
      : variant === 'danger'
      ? colors.danger
      : variant === 'amber'
      ? colors.terminalAmber
      : colors.terminalBorder;

  return (
    <View style={[styles.wrapper, { borderColor }, style]}>
      {title && (
        <View style={styles.titleRow}>
          <Text style={[styles.cornerTL, { color: borderColor }]}>┌─</Text>
          <Text style={[styles.titleText, { color: borderColor }]}>{title}</Text>
          <Text style={[styles.cornerTR, { color: borderColor }]}>─┐</Text>
        </View>
      )}
      <View style={{ padding }}>{children}</View>
      {title && (
        <View style={styles.bottomRow}>
          <Text style={[styles.cornerBL, { color: borderColor }]}>└</Text>
          <View style={[styles.bottomLine, { backgroundColor: borderColor }]} />
          <Text style={[styles.cornerBR, { color: borderColor }]}>┘</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 4,
    overflow: 'hidden',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  cornerTL: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    lineHeight: 16,
  },
  cornerTR: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    lineHeight: 16,
  },
  titleText: {
    flex: 1,
    fontFamily: 'SpaceMono',
    fontSize: 11,
    letterSpacing: 1.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  cornerBL: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    lineHeight: 16,
  },
  cornerBR: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    lineHeight: 16,
  },
  bottomLine: {
    flex: 1,
    height: 1,
    opacity: 0.5,
  },
});

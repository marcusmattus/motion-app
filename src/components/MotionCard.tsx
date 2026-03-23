import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing, shadows } from '../lib/theme';

type MotionCardProps = {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glow';
  style?: ViewStyle;
  padding?: keyof typeof spacing;
};

export function MotionCard({
  children,
  variant = 'default',
  style,
  padding = 'lg',
}: MotionCardProps) {
  return (
    <View
      style={[
        styles.base,
        { padding: spacing[padding] },
        variant === 'elevated' && styles.elevated,
        variant === 'glow' && styles.glow,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  elevated: {
    ...shadows.elev1,
    borderColor: 'transparent',
  },
  glow: {
    ...shadows.glow,
    borderColor: colors.primary,
  },
});

import React, { useEffect, useRef, useState } from 'react';
import { Text, TextStyle, Animated } from 'react-native';
import { colors } from '../lib/theme';

type TerminalTextProps = {
  children: React.ReactNode;
  style?: TextStyle;
  mono?: boolean;
  dim?: boolean;
  color?: string;
  blinkCursor?: boolean;
  prefix?: string;
};

export function TerminalText({
  children,
  style,
  mono = false,
  dim = false,
  color,
  blinkCursor = false,
  prefix,
}: TerminalTextProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!blinkCursor) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [blinkCursor, opacity]);

  const textColor = color ?? (dim ? colors.textMuted : colors.textSecondary);

  return (
    <Text
      style={[
        mono ? { fontFamily: 'SpaceMono' } : undefined,
        { color: textColor },
        style,
      ]}
    >
      {prefix ? (
        <Text style={{ color: colors.terminalGreen, fontFamily: 'SpaceMono' }}>{prefix} </Text>
      ) : null}
      {children}
      {blinkCursor && (
        <Animated.Text style={{ opacity, color: colors.terminalGreen, fontFamily: 'SpaceMono' }}>
          {' '}▮
        </Animated.Text>
      )}
    </Text>
  );
}

type MonoValueProps = {
  value: string | number;
  label: string;
  color?: string;
  style?: TextStyle;
};

export function MonoValue({ value, label, color, style }: MonoValueProps) {
  return (
    <Text style={[{ fontFamily: 'SpaceMono', color: colors.textPrimary }, style]}>
      <Text style={{ color: color ?? colors.terminalGreen, fontSize: 28, fontWeight: 'bold' }}>
        {value}
      </Text>
      {'\n'}
      <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 2 }}>
        [{label}]
      </Text>
    </Text>
  );
}

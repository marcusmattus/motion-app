import React from 'react';
import { Pressable, Text, ViewStyle, TextStyle, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, shadows } from '../lib/theme';

type MotionButtonProps = {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
};

export function MotionButton({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  onPress,
  disabled,
  style,
  fullWidth,
}: MotionButtonProps) {
  const sizeStyles = sizes[size];
  const variantStyles = variants[variant];

  const content = (
    <View style={styles.content}>
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text style={[styles.label, sizeStyles.text, variantStyles.text]}>{label}</Text>
    </View>
  );

  if (variant === 'gradient' && !disabled) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={[styles.base, sizeStyles.button, fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={['#1E90FF', '#00FF7F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, sizeStyles.button]}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyles.button,
        variantStyles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const sizes = {
  sm: {
    button: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.sm,
    } as ViewStyle,
    text: {
      fontSize: 14,
    } as TextStyle,
  },
  md: {
    button: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
    } as ViewStyle,
    text: {
      fontSize: 16,
    } as TextStyle,
  },
  lg: {
    button: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      borderRadius: radius.lg,
    } as ViewStyle,
    text: {
      fontSize: 18,
    } as TextStyle,
  },
};

const variants = {
  primary: {
    button: {
      backgroundColor: colors.primary,
      ...shadows.glow,
    } as ViewStyle,
    text: {
      color: colors.textPrimary,
    } as TextStyle,
  },
  secondary: {
    button: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.primary,
    } as ViewStyle,
    text: {
      color: colors.primary,
    } as TextStyle,
  },
  ghost: {
    button: {
      backgroundColor: 'transparent',
    } as ViewStyle,
    text: {
      color: colors.textSecondary,
    } as TextStyle,
  },
  gradient: {
    button: {} as ViewStyle,
    text: {
      color: colors.charcoal,
    } as TextStyle,
  },
  danger: {
    button: {
      backgroundColor: colors.danger,
    } as ViewStyle,
    text: {
      color: colors.textPrimary,
    } as TextStyle,
  },
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: spacing.sm,
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
});

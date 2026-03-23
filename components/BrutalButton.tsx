import { Pressable, Text, ViewStyle, StyleSheet } from 'react-native';

type BrutalButtonProps = {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

const palette: Record<BrutalButtonProps['variant'], ViewStyle> = {
  primary: { backgroundColor: '#FF2E63' },
  secondary: { backgroundColor: '#F0F0F0' },
  ghost: { backgroundColor: 'transparent' }
};

export function BrutalButton({ label, variant = 'primary', onPress, disabled, style }: BrutalButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={StyleSheet.flatten([
        styles.button,
        palette[variant],
        disabled && styles.disabled,
        style
      ])}
    >
      <Text style={[styles.label, variant === 'secondary' ? styles.secondaryText : styles.primaryText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 4,
    borderColor: '#000',
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_700Bold'
  },
  primaryText: {
    color: '#000'
  },
  secondaryText: {
    color: '#FF2E63'
  },
  disabled: {
    opacity: 0.5
  }
});

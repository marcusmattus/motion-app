import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '../../src/lib/theme';
import { TerminalCard } from '../../src/components/TerminalCard';
import { TerminalText } from '../../src/components/TerminalText';
import { useMotionStore } from '../../src/state/store';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, setUser, setOnboardingComplete, trackingConfig, updateTrackingConfig, clearSessions } =
    useMotionStore();

  const [notifications, setNotifications] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [cursorBlink, setCursorBlink] = useState(true);

  const handleLogout = () => {
    Alert.alert('[CONFIRM_SIGNOUT]', 'Sign out of current session?', [
      { text: '> CANCEL', style: 'cancel' },
      {
        text: '> CONFIRM',
        style: 'destructive',
        onPress: () => {
          setUser(null);
          setOnboardingComplete(false);
          router.replace('/');
        },
      },
    ]);
  };

  const ConfigSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <TerminalCard title={title} style={styles.section}>
      {children}
    </TerminalCard>
  );

  const ConfigRow = ({
    label,
    value,
    onPress,
    isDanger,
    children,
  }: {
    label: string;
    value?: string;
    onPress?: () => void;
    isDanger?: boolean;
    children?: React.ReactNode;
  }) => (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress && !children}>
      <Text style={[styles.rowLabel, isDanger && styles.dangerText]}>{label}</Text>
      {value && <Text style={[styles.rowValue, isDanger && styles.dangerText]}>{value}</Text>}
      {children}
      {onPress && !children && (
        <Text style={styles.chevron}>›</Text>
      )}
    </Pressable>
  );

  const ToggleRow = ({
    label,
    value,
    onChange,
    isDanger,
  }: {
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
    isDanger?: boolean;
  }) => (
    <ConfigRow label={label} isDanger={isDanger}>
      <View style={styles.rowRight}>
        <Text style={[styles.toggleValue, { color: value ? colors.terminalGreen : colors.textMuted }]}>
          {value ? 'ON' : 'OFF'}
        </Text>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: colors.surface, true: colors.terminalGreen }}
          thumbColor={value ? colors.terminalGreen : colors.textMuted}
        />
      </View>
    </ConfigRow>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User info */}
      <TerminalCard style={styles.userCard}>
        <View style={styles.userRow}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{user?.displayName?.[0]?.toUpperCase() ?? 'U'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.displayName ?? 'MOTION_USER'}</Text>
            <TerminalText mono color={colors.textMuted} style={styles.userStatus}>
              {'> SYSTEM READY'}
            </TerminalText>
          </View>
          <Pressable style={styles.editBtn}>
            <Icon name="pencil-outline" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      </TerminalCard>

      {/* CAMERA */}
      <ConfigSection title="CAMERA">
        <ConfigRow
          label="camera_facing"
          value={trackingConfig.cameraFacing.toUpperCase()}
          onPress={() =>
            updateTrackingConfig({
              cameraFacing: trackingConfig.cameraFacing === 'front' ? 'back' : 'front',
            })
          }
        />
        <ConfigRow label="model" value={trackingConfig.modelConfig.modelType} onPress={() => router.push('/forge/model' as any)} />
        <ConfigRow label="confidence" value={trackingConfig.modelConfig.confidenceThreshold.toFixed(2)} onPress={() => router.push('/forge/model' as any)} />
      </ConfigSection>

      {/* NOTIFICATIONS */}
      <ConfigSection title="NOTIFICATIONS">
        <ToggleRow label="push_alerts" value={notifications} onChange={setNotifications} />
        <ToggleRow label="haptic_feedback" value={haptics} onChange={setHaptics} />
      </ConfigSection>

      {/* DATA_EXPORT */}
      <ConfigSection title="DATA_EXPORT">
        <ConfigRow
          label="export_csv"
          value="CSV"
          onPress={() =>
            Alert.alert('[EXPORT]', 'Data export will be prepared and emailed.')
          }
        />
        <ConfigRow
          label="supabase_sync"
          value="READY"
        />
        <ConfigRow
          label="clear_sessions"
          isDanger
          onPress={() =>
            Alert.alert('[CONFIRM]', 'Delete all session history?', [
              { text: '> CANCEL', style: 'cancel' },
              { text: '> DELETE', style: 'destructive', onPress: () => clearSessions() },
            ])
          }
        />
      </ConfigSection>

      {/* APPEARANCE */}
      <ConfigSection title="APPEARANCE">
        <ToggleRow
          label="scanline_overlay"
          value={trackingConfig.showScanlines}
          onChange={(v) => updateTrackingConfig({ showScanlines: v })}
        />
        <ToggleRow
          label="skeleton_overlay"
          value={trackingConfig.showSkeleton}
          onChange={(v) => updateTrackingConfig({ showSkeleton: v })}
        />
        <ToggleRow label="cursor_blink" value={cursorBlink} onChange={setCursorBlink} />
      </ConfigSection>

      {/* ACCOUNT */}
      <ConfigSection title="ACCOUNT">
        <ConfigRow label="units" value={(user?.unitSystem ?? 'metric').toUpperCase()} />
        <ConfigRow
          label="reset_onboarding"
          onPress={() => {
            setOnboardingComplete(false);
            Alert.alert('[RESET]', 'Onboarding will show on next launch.');
          }}
        />
        <ConfigRow label="sign_out" isDanger onPress={handleLogout} />
      </ConfigSection>

      <Text style={styles.version}>{'> MOTION/TRACK v1.0.0'}</Text>
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
  userCard: {
    marginBottom: spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.terminalGreen,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,255,65,0.08)',
  },
  userAvatarText: {
    fontFamily: 'SpaceMono',
    fontSize: 20,
    color: colors.terminalGreen,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userName: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  userStatus: {
    fontSize: 10,
    marginTop: 2,
  },
  editBtn: {
    padding: spacing.sm,
  },
  section: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.terminalBorder,
    minHeight: 44,
  },
  rowLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: colors.terminalBlue,
    flex: 1,
  },
  rowValue: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: colors.terminalGreen,
    marginRight: spacing.sm,
  },
  chevron: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    color: colors.textMuted,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toggleValue: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    letterSpacing: 1,
  },
  dangerText: {
    color: colors.danger,
  },
  version: {
    fontFamily: 'SpaceMono',
    textAlign: 'center',
    fontSize: 10,
    color: colors.textMuted,
    marginTop: spacing.lg,
    letterSpacing: 1,
  },
});


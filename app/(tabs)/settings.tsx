import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MotionCard } from '../../src/components/MotionCard';
import { MotionButton } from '../../src/components/MotionButton';
import { colors, spacing, radius } from '../../src/lib/theme';
import { useMotionStore } from '../../src/state/store';

interface SettingItem {
  id: string;
  icon: string;
  label: string;
  value?: string;
  type: 'navigate' | 'toggle' | 'action';
  dangerous?: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, setUser, setOnboardingComplete } = useMotionStore();
  const [notifications, setNotifications] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [serverPose, setServerPose] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            setUser(null);
            setOnboardingComplete(false);
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will show the welcome tutorial again on next launch.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            setOnboardingComplete(false);
            Alert.alert('Done', 'Onboarding will show on next app launch.');
          },
        },
      ]
    );
  };

  const accountSettings: SettingItem[] = [
    { id: 'profile', icon: 'account-circle', label: 'Edit Profile', type: 'navigate' },
    { id: 'units', icon: 'scale', label: 'Units', value: user?.unitSystem || 'metric', type: 'navigate' },
    { id: 'avatar', icon: 'human', label: 'Recalibrate Avatar', type: 'navigate' },
  ];

  const appSettings: SettingItem[] = [
    { id: 'notifications', icon: 'bell', label: 'Notifications', type: 'toggle' },
    { id: 'haptics', icon: 'vibrate', label: 'Haptic Feedback', type: 'toggle' },
    { id: 'dark', icon: 'moon-waning-crescent', label: 'Dark Mode', type: 'toggle' },
  ];

  const coachSettings: SettingItem[] = [
    { id: 'camera', icon: 'camera', label: 'Camera Position Guide', type: 'navigate' },
    { id: 'server', icon: 'cloud-upload', label: 'Server-side Pose Analysis', type: 'toggle' },
    { id: 'rules', icon: 'clipboard-list', label: 'Form Rules', type: 'navigate' },
  ];

  const dataSettings: SettingItem[] = [
    { id: 'export', icon: 'download', label: 'Export Data', type: 'action' },
    { id: 'privacy', icon: 'shield-lock', label: 'Privacy Policy', type: 'navigate' },
    { id: 'reset', icon: 'refresh', label: 'Reset Onboarding', type: 'action' },
    { id: 'delete', icon: 'delete', label: 'Delete Account', type: 'action', dangerous: true },
  ];

  const getToggleValue = (id: string) => {
    switch (id) {
      case 'notifications': return notifications;
      case 'haptics': return haptics;
      case 'dark': return darkMode;
      case 'server': return serverPose;
      default: return false;
    }
  };

  const handleToggle = (id: string) => {
    switch (id) {
      case 'notifications': setNotifications(!notifications); break;
      case 'haptics': setHaptics(!haptics); break;
      case 'dark': setDarkMode(!darkMode); break;
      case 'server': setServerPose(!serverPose); break;
    }
  };

  const handleAction = (id: string) => {
    switch (id) {
      case 'export':
        Alert.alert('Export', 'Your data export will be prepared and emailed to you.');
        break;
      case 'reset':
        handleResetOnboarding();
        break;
      case 'delete':
        Alert.alert(
          'Delete Account',
          'This action cannot be undone. All your data will be permanently deleted.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => {} },
          ]
        );
        break;
    }
  };

  const renderSettingItem = (item: SettingItem) => (
    <Pressable
      key={item.id}
      style={styles.settingRow}
      onPress={() => {
        if (item.type === 'navigate') {
          // Navigate to detail screen
        } else if (item.type === 'action') {
          handleAction(item.id);
        }
      }}
    >
      <View style={[styles.settingIcon, item.dangerous && styles.settingIconDanger]}>
        <Icon
          name={item.icon}
          size={20}
          color={item.dangerous ? colors.danger : colors.primary}
        />
      </View>
      <Text style={[styles.settingLabel, item.dangerous && styles.settingLabelDanger]}>
        {item.label}
      </Text>
      {item.type === 'toggle' ? (
        <Switch
          value={getToggleValue(item.id)}
          onValueChange={() => handleToggle(item.id)}
          trackColor={{ false: colors.surface, true: colors.primary }}
          thumbColor={colors.textPrimary}
        />
      ) : item.value ? (
        <View style={styles.settingValueContainer}>
          <Text style={styles.settingValue}>{item.value}</Text>
          <Icon name="chevron-right" size={20} color={colors.textSecondary} />
        </View>
      ) : (
        <Icon name="chevron-right" size={20} color={colors.textSecondary} />
      )}
    </Pressable>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Card */}
      <MotionCard style={styles.userCard}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {user?.displayName?.[0] || 'U'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.displayName || 'Motion User'}</Text>
          <Text style={styles.userEmail}>user@example.com</Text>
        </View>
        <Pressable style={styles.editButton}>
          <Icon name="pencil" size={20} color={colors.primary} />
        </Pressable>
      </MotionCard>

      {/* Account Settings */}
      <Text style={styles.sectionTitle}>Account</Text>
      <MotionCard style={styles.settingsCard}>
        {accountSettings.map((item, index) => (
          <View key={item.id}>
            {renderSettingItem(item)}
            {index < accountSettings.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </MotionCard>

      {/* App Settings */}
      <Text style={styles.sectionTitle}>App</Text>
      <MotionCard style={styles.settingsCard}>
        {appSettings.map((item, index) => (
          <View key={item.id}>
            {renderSettingItem(item)}
            {index < appSettings.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </MotionCard>

      {/* Coach Settings */}
      <Text style={styles.sectionTitle}>AI Coach</Text>
      <MotionCard style={styles.settingsCard}>
        {coachSettings.map((item, index) => (
          <View key={item.id}>
            {renderSettingItem(item)}
            {index < coachSettings.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </MotionCard>

      {/* Data & Privacy */}
      <Text style={styles.sectionTitle}>Data & Privacy</Text>
      <MotionCard style={styles.settingsCard}>
        {dataSettings.map((item, index) => (
          <View key={item.id}>
            {renderSettingItem(item)}
            {index < dataSettings.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </MotionCard>

      {/* Sign Out Button */}
      <MotionButton
        label="Sign Out"
        variant="secondary"
        onPress={handleLogout}
        style={styles.signOutButton}
      />

      {/* App Version */}
      <Text style={styles.version}>Motion v1.0.0</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingsCard: {
    paddingVertical: spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingIconDanger: {
    backgroundColor: 'rgba(255, 77, 79, 0.1)',
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  settingLabelDanger: {
    color: colors.danger,
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: spacing.xs,
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: colors.surface,
    marginLeft: 52,
  },
  signOutButton: {
    marginTop: spacing.xl,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
});

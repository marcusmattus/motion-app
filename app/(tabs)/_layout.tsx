import React from 'react';
import { Tabs } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, tabBarTheme } from '../../src/lib/theme';
import { tabIcons, TabName } from '../../src/lib/icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.terminalBorder,
        },
        headerTitleStyle: {
          color: colors.terminalGreen,
          fontFamily: 'SpaceMono',
          fontSize: 14,
          letterSpacing: 2,
        },
        headerTintColor: colors.terminalGreen,
        tabBarStyle: {
          backgroundColor: tabBarTheme.backgroundColor,
          borderTopColor: tabBarTheme.borderTopColor,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 25,
          paddingTop: 8,
        },
        tabBarActiveTintColor: tabBarTheme.activeTintColor,
        tabBarInactiveTintColor: tabBarTheme.inactiveTintColor,
        tabBarLabelStyle: {
          fontFamily: 'SpaceMono',
          fontSize: 9,
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = tabIcons[route.name as TabName];
          if (!icons) return null;
          return (
            <Icon
              name={focused ? icons.active : icons.inactive}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      {/* PRIMARY — Camera is first tab */}
      <Tabs.Screen
        name="camera"
        options={{
          title: 'CAMERA',
          headerTitle: 'MOTION/TRACK',
          headerShown: false, // full-screen camera
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'DATA',
          headerTitle: '> ANALYTICS',
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'COACH',
          headerTitle: '> AI_COACH',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'CONFIG',
          headerTitle: '> SETTINGS',
        }}
      />
      {/* Hidden legacy tabs — kept to avoid broken routes */}
      <Tabs.Screen name="today" options={{ href: null }} />
      <Tabs.Screen name="progress" options={{ href: null }} />
      <Tabs.Screen name="social" options={{ href: null }} />
    </Tabs>
  );
}

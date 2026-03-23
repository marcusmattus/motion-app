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
        },
        headerTitleStyle: {
          color: colors.textPrimary,
          fontWeight: 'bold',
        },
        headerTintColor: colors.textPrimary,
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
          fontSize: 11,
          fontWeight: '500',
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
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          headerTitle: 'Motion',
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          headerTitle: 'Your Progress',
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Social',
          headerTitle: 'Community',
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'Coach',
          headerTitle: 'AI Coach',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
        }}
      />
    </Tabs>
  );
}

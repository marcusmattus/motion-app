import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { colors } from '../src/lib/theme';

const queryClient = new QueryClient();

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const headerDefaults = {
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.terminalGreen,
    headerTitleStyle: { fontFamily: 'SpaceMono', fontSize: 13, letterSpacing: 2 } as any,
    headerShown: true,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen
          name="nutrition/index"
          options={{ ...headerDefaults, title: '> FUEL_SCAN' }}
        />
        <Stack.Screen
          name="forge/index"
          options={{ ...headerDefaults, title: '> FORGE' }}
        />
        <Stack.Screen
          name="forge/run"
          options={{ ...headerDefaults, title: '> RUN_MISSION' }}
        />
        <Stack.Screen
          name="forge/camera"
          options={{ ...headerDefaults, title: '> ACTIVE_MOTION' }}
        />
        <Stack.Screen
          name="forge/session"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="forge/model"
          options={{ ...headerDefaults, title: '> TRACKING_CONFIG' }}
        />
        <Stack.Screen
          name="progress/index"
          options={{ ...headerDefaults, title: '> THE_MIRROR' }}
        />
        <Stack.Screen
          name="debrief/index"
          options={{ ...headerDefaults, title: '> SESSION_DEBRIEF' }}
        />
      </Stack>
    </QueryClientProvider>
  );
}


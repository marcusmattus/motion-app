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
    // Hide splash screen after a brief delay
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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
        <Stack.Screen name="nutrition/index" options={{ title: 'Fuel Scan', headerShown: true, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.textPrimary }} />
        <Stack.Screen name="forge/index" options={{ title: 'Forge', headerShown: true, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.textPrimary }} />
        <Stack.Screen name="forge/run" options={{ title: 'Run Mission', headerShown: true, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.textPrimary }} />
        <Stack.Screen name="forge/camera" options={{ title: 'Active Motion', headerShown: true, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.textPrimary }} />
        <Stack.Screen name="progress/index" options={{ title: 'The Mirror', headerShown: true, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.textPrimary }} />
        <Stack.Screen name="debrief/index" options={{ title: 'Debrief', headerShown: true, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.textPrimary }} />
      </Stack>
    </QueryClientProvider>
  );
}

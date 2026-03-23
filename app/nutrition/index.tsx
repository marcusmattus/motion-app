import { useCallback, useRef, useState, useEffect } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, View, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { MotionButton } from '../../src/components/MotionButton';
import { MotionCard } from '../../src/components/MotionCard';
import { colors, spacing, radius } from '../../src/lib/theme';
import { analyzeNutrition } from '../../services/gemini';

type MacroRow = { label: string; value: string };

export default function NutritionScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [receipt, setReceipt] = useState<MacroRow[]>([]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const requestPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleCapture = useCallback(async () => {
    if (!hasPermission) {
      await requestPermission();
      return;
    }

    if (!cameraRef.current) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
      if (!photo) return;
      setPhotoUri(photo.uri);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const macros = await analyzeNutrition(photo.base64 || '');
      setReceipt(macros);
    } catch (error) {
      console.error(error);
      Alert.alert('Scan Failed', 'Unable to analyze fuel. Try again with more light.');
    } finally {
      setIsCapturing(false);
    }
  }, [hasPermission]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Fuel Scan</Text>
        <View style={styles.viewfinder}>
          {hasPermission ? (
            <Camera ref={cameraRef} type={CameraType.back} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={styles.permissionBox}>
              <Text style={styles.permissionText}>Camera access required.</Text>
              <MotionButton label="Allow Camera" onPress={requestPermission} variant="secondary" />
            </View>
          )}
        </View>
        <MotionButton label={photoUri ? 'Rescan Fuel' : 'Scan Meal'} onPress={handleCapture} disabled={isCapturing} variant="gradient" fullWidth />
        {isCapturing && (
          <View style={styles.statusRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.statusText}>Analyzing macros...</Text>
          </View>
        )}
        {photoUri && <Image source={{ uri: photoUri }} style={styles.preview} />}
        {receipt.length > 0 && (
          <MotionCard style={styles.receiptCard}>
            <Text style={styles.receiptTitle}>Nutrition Breakdown</Text>
            {receipt.map((row) => (
              <View key={row.label} style={styles.row}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowValue}>{row.value}</Text>
              </View>
            ))}
          </MotionCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.md },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary },
  viewfinder: {
    borderRadius: radius.lg,
    height: 320,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  permissionBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  permissionText: { color: colors.textSecondary, marginBottom: spacing.md },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusText: { color: colors.textSecondary },
  preview: { width: '100%', height: 220, borderRadius: radius.lg },
  receiptCard: { marginTop: spacing.md },
  receiptTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: colors.surface, paddingVertical: spacing.sm },
  rowLabel: { color: colors.textSecondary },
  rowValue: { fontWeight: '600', color: colors.textPrimary },
});

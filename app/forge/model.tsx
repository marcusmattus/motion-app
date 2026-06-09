import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, spacing } from '../../src/lib/theme';
import { TerminalCard } from '../../src/components/TerminalCard';
import { TerminalText } from '../../src/components/TerminalText';
import { useMotionStore } from '../../src/state/store';
import { EXERCISES, ExerciseId } from '../../src/vision/repCounter';
import { updatePoseDetectorConfig } from '../../src/vision/poseDetector';
import { useRouter } from 'expo-router';

type ModelType = 'MoveNet_Lightning' | 'MoveNet_Thunder';

export default function ModelConfigScreen() {
  const router = useRouter();
  const { trackingConfig, updateTrackingConfig } = useMotionStore();
  const cfg = trackingConfig;

  const [modelType, setModelType] = useState<ModelType>(cfg.modelConfig.modelType);
  const [confidence, setConfidence] = useState(cfg.modelConfig.confidenceThreshold);
  const [smoothing, setSmoothing] = useState(cfg.modelConfig.enableSmoothing);
  const [autoDetect, setAutoDetect] = useState(cfg.autoDetect);
  const [exercise, setExercise] = useState<ExerciseId>(cfg.selectedExercise);
  const [showSkeleton, setShowSkeleton] = useState(cfg.showSkeleton);
  const [showAngles, setShowAngles] = useState(cfg.showAngles);
  const [showConfidence, setShowConfidence] = useState(cfg.showConfidence);
  const [showScanlines, setShowScanlines] = useState(cfg.showScanlines);
  const [heatmap, setHeatmap] = useState<'MUSCLE' | 'JOINT'>('MUSCLE');
  const [isDirty, setIsDirty] = useState(false);

  const markDirty = () => setIsDirty(true);

  const applyConfig = () => {
    const newModelConfig = {
      modelType,
      confidenceThreshold: confidence,
      enableSmoothing: smoothing,
    };
    updateTrackingConfig({
      modelConfig: newModelConfig,
      autoDetect,
      selectedExercise: exercise,
      showSkeleton,
      showAngles,
      showConfidence,
      showScanlines,
    });
    updatePoseDetectorConfig(newModelConfig);
    setIsDirty(false);
    Alert.alert('[CONFIG_APPLIED]', 'Tracking configuration saved.', [
      { text: '> OK', onPress: () => router.back() },
    ]);
  };

  const ConfigRow = ({
    label,
    value,
    children,
  }: {
    label: string;
    value?: string;
    children?: React.ReactNode;
  }) => (
    <View style={styles.configRow}>
      <Text style={styles.configKey}>{label}</Text>
      <Text style={styles.configEquals}>=</Text>
      {value ? <Text style={styles.configValue}>{value}</Text> : null}
      {children}
    </View>
  );

  const ToggleRow = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <ConfigRow label={label} value={value ? 'ON' : 'OFF'}>
      <Switch
        value={value}
        onValueChange={(v) => { onChange(v); markDirty(); }}
        trackColor={{ false: colors.surface, true: colors.terminalGreen }}
        thumbColor={value ? colors.terminalGreen : colors.textMuted}
        style={styles.switch}
      />
    </ConfigRow>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TerminalText mono prefix=">" color={colors.textSecondary} style={styles.headerLine}>
        TRACKING_CONFIG.CONF
      </TerminalText>

      {/* DETECTION_MODEL */}
      <TerminalCard title="DETECTION_MODEL" style={styles.section}>
        <ConfigRow label="model" value={modelType}>
          <View style={styles.modelToggle}>
            {(['MoveNet_Lightning', 'MoveNet_Thunder'] as ModelType[]).map((m) => (
              <Pressable
                key={m}
                style={[styles.modelBtn, modelType === m && styles.modelBtnActive]}
                onPress={() => { setModelType(m); markDirty(); }}
              >
                <Text style={[styles.modelBtnText, modelType === m && styles.modelBtnTextActive]}>
                  {m === 'MoveNet_Lightning' ? 'LIGHTNING' : 'THUNDER'}
                </Text>
              </Pressable>
            ))}
          </View>
        </ConfigRow>

        <ConfigRow label="confidence_threshold" value={confidence.toFixed(2)}>
          <Slider
            style={styles.slider}
            minimumValue={0.1}
            maximumValue={0.9}
            step={0.05}
            value={confidence}
            onValueChange={(v) => { setConfidence(v); markDirty(); }}
            minimumTrackTintColor={colors.terminalGreen}
            maximumTrackTintColor={colors.terminalBorder}
            thumbTintColor={colors.terminalGreen}
          />
        </ConfigRow>

        <ToggleRow label="skeleton_smoothing" value={smoothing} onChange={setSmoothing} />
      </TerminalCard>

      {/* EXERCISE_DETECTION */}
      <TerminalCard title="EXERCISE_DETECTION" style={styles.section}>
        <ToggleRow label="auto_detect" value={autoDetect} onChange={setAutoDetect} />

        <View style={styles.configRow}>
          <Text style={styles.configKey}>exercise</Text>
          <Text style={styles.configEquals}>=</Text>
          <Text style={styles.configValue}>{exercise}</Text>
        </View>
        <View style={styles.exerciseGrid}>
          {EXERCISES.map((ex) => (
            <Pressable
              key={ex.id}
              style={[styles.exBtn, exercise === ex.id && styles.exBtnActive]}
              onPress={() => { setExercise(ex.id); markDirty(); }}
            >
              <Text style={[styles.exBtnText, exercise === ex.id && styles.exBtnTextActive]}>
                {ex.id}
              </Text>
              <Text style={styles.exMuscle}>{ex.muscle}</Text>
            </Pressable>
          ))}
        </View>
      </TerminalCard>

      {/* TRACKING_OVERLAY */}
      <TerminalCard title="TRACKING_OVERLAY" style={styles.section}>
        <ToggleRow label="show_skeleton" value={showSkeleton} onChange={setShowSkeleton} />
        <ToggleRow label="show_angles" value={showAngles} onChange={setShowAngles} />
        <ToggleRow label="show_confidence" value={showConfidence} onChange={setShowConfidence} />
        <ToggleRow label="scanline_overlay" value={showScanlines} onChange={setShowScanlines} />

        <View style={styles.configRow}>
          <Text style={styles.configKey}>heatmap_mode</Text>
          <Text style={styles.configEquals}>=</Text>
          <View style={styles.heatmapToggle}>
            {(['MUSCLE', 'JOINT'] as const).map((m) => (
              <Pressable
                key={m}
                style={[styles.modelBtn, heatmap === m && styles.modelBtnActive]}
                onPress={() => { setHeatmap(m); markDirty(); }}
              >
                <Text style={[styles.modelBtnText, heatmap === m && styles.modelBtnTextActive]}>{m}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </TerminalCard>

      {/* Apply button */}
      <Pressable
        style={[styles.applyBtn, isDirty && styles.applyBtnDirty]}
        onPress={applyConfig}
      >
        <Text style={[styles.applyBtnText, isDirty && styles.applyBtnTextDirty]}>
          {`> APPLY_CONFIG${isDirty ? ' *' : ''}`}
        </Text>
      </Pressable>
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
  headerLine: {
    fontSize: 12,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.md,
  },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.terminalBorder,
    minHeight: 44,
  },
  configKey: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: colors.terminalBlue,
    minWidth: 160,
  },
  configEquals: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: colors.textMuted,
    marginHorizontal: spacing.xs,
  },
  configValue: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: colors.terminalGreen,
    flex: 1,
  },
  switch: {
    marginLeft: 'auto' as any,
  },
  slider: {
    flex: 1,
    height: 36,
    marginLeft: spacing.sm,
  },
  modelToggle: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginLeft: spacing.sm,
  },
  modelBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.terminalBorder,
    borderRadius: 3,
  },
  modelBtnActive: {
    borderColor: colors.terminalGreen,
    backgroundColor: 'rgba(0,255,65,0.1)',
  },
  modelBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: colors.textMuted,
  },
  modelBtnTextActive: {
    color: colors.terminalGreen,
  },
  heatmapToggle: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginLeft: spacing.sm,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  exBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.terminalBorder,
    borderRadius: 3,
    alignItems: 'center',
  },
  exBtnActive: {
    borderColor: colors.terminalGreen,
    backgroundColor: 'rgba(0,255,65,0.08)',
  },
  exBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  exBtnTextActive: {
    color: colors.terminalGreen,
  },
  exMuscle: {
    fontFamily: 'SpaceMono',
    fontSize: 8,
    color: colors.textMuted,
    opacity: 0.6,
    marginTop: 2,
  },
  applyBtn: {
    borderWidth: 1,
    borderColor: colors.terminalBorder,
    borderStyle: 'dashed',
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: 4,
    marginTop: spacing.md,
    backgroundColor: colors.card,
  },
  applyBtnDirty: {
    borderColor: colors.terminalGreen,
    backgroundColor: 'rgba(0,255,65,0.08)',
  },
  applyBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  applyBtnTextDirty: {
    color: colors.terminalGreen,
  },
});

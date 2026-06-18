import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '../../src/lib/theme';
import { HUDOverlay } from '../../src/components/HUDOverlay';
import { PoseSkeleton, Keypoint } from '../../src/components/PoseSkeleton';
import { TerminalCard } from '../../src/components/TerminalCard';
import { TerminalText } from '../../src/components/TerminalText';
import { useMotionStore } from '../../src/state/store';
import { initPoseDetector, detectPose } from '../../src/vision/poseDetector';
import { processRepFrame, ExerciseId, EXERCISES } from '../../src/vision/repCounter';
import { scoreForm } from '../../src/vision/formScorer';
import { analyzeSymmetry } from '../../src/vision/symmetryAnalyzer';
import { DETECTION_INTERVAL_MS } from '../../src/vision/config';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SESSION_ID = 'camera-tab-session';

export default function CameraTab() {
  const router = useRouter();
  const {
    trackingConfig,
    updateTrackingConfig,
    setLiveReps,
    setLiveFormScore,
    setLiveSymmetryScore,
    setLiveTempo,
    liveReps,
    liveFormScore,
    liveSymmetryScore,
    liveTempo,
    resetLiveSession,
  } = useMotionStore();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [keypoints, setKeypoints] = useState<Keypoint[]>([]);
  const [sessionTime, setSessionTime] = useState(0);
  const [status, setStatus] = useState<'CALIBRATING...' | 'JOINTS LOCKED' | 'TRACKING ACTIVE' | 'SYSTEM READY'>('SYSTEM READY');
  const [isRunning, setIsRunning] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(trackingConfig.showSkeleton);
  const [showScanlines, setShowScanlines] = useState(trackingConfig.showScanlines);

  const repFlash = useRef(new Animated.Value(0)).current;
  const blinkDot = useRef(new Animated.Value(1)).current;
  const detectionInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevReps = useRef(0);

  // Blink the REC dot
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkDot, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(blinkDot, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [blinkDot]);

  useEffect(() => {
    (async () => {
      const { status: s } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(s === 'granted');
      await initPoseDetector(trackingConfig.modelConfig);
    })();
    return () => {
      if (detectionInterval.current) clearInterval(detectionInterval.current);
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, []);

  const startTracking = useCallback(() => {
    resetLiveSession();
    prevReps.current = 0;
    setIsRunning(true);
    setStatus('CALIBRATING...');

    timerInterval.current = setInterval(() => setSessionTime((t) => t + 1), 1000);

    detectionInterval.current = setInterval(async () => {
      const result = await detectPose();
      if (!result) return;

      const mapped: Keypoint[] = result.keypoints.map((k) => ({
        x: k.x,
        y: k.y,
        score: k.score,
        name: k.name,
      }));
      setKeypoints(mapped);

      const ex = trackingConfig.selectedExercise as ExerciseId;
      const repUpdate = processRepFrame(result.keypoints, ex, SESSION_ID);
      const form = scoreForm(result.keypoints, ex);
      const sym = analyzeSymmetry(result.keypoints);

      setLiveReps(repUpdate.reps);
      setLiveFormScore(form.score);
      setLiveSymmetryScore(sym.overallScore);
      setLiveTempo(repUpdate.avgTempo);

      if (form.score > 40) {
        setStatus('TRACKING ACTIVE');
      } else {
        setStatus('CALIBRATING...');
      }

      if (repUpdate.reps > prevReps.current) {
        prevReps.current = repUpdate.reps;
        Animated.sequence([
          Animated.timing(repFlash, { toValue: 1, duration: 80, useNativeDriver: true }),
          Animated.timing(repFlash, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
      }
    }, DETECTION_INTERVAL_MS);
  }, [trackingConfig, resetLiveSession, setLiveReps, setLiveFormScore, setLiveSymmetryScore, setLiveTempo, repFlash]);

  const stopTracking = useCallback(() => {
    setIsRunning(false);
    setStatus('SYSTEM READY');
    if (detectionInterval.current) clearInterval(detectionInterval.current);
    if (timerInterval.current) clearInterval(timerInterval.current);
    setSessionTime(0);
    setKeypoints([]);
  }, []);

  const formatTime = (secs: number) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, '0');
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const formColor =
    liveFormScore >= 80
      ? colors.terminalGreen
      : liveFormScore >= 55
      ? colors.terminalAmber
      : colors.danger;

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <TerminalText mono color={colors.textMuted}>{'> REQUESTING CAMERA ACCESS...'}</TerminalText>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Icon name="camera-off" size={48} color={colors.textMuted} />
        <TerminalText mono color={colors.textMuted} style={styles.permissionText}>
          CAMERA_ACCESS_DENIED
        </TerminalText>
        <Pressable
          style={styles.termBtn}
          onPress={async () => {
            const { status: s } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(s === 'granted');
          }}
        >
          <Text style={styles.termBtnText}>{`> GRANT_CAMERA_ACCESS`}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Camera */}
      <Camera
        style={styles.camera}
        type={trackingConfig.cameraFacing === 'front' ? CameraType.front : CameraType.back}
      />

      {/* Pose Skeleton Overlay */}
      {showSkeleton && keypoints.length > 0 && (
        <PoseSkeleton
          keypoints={keypoints}
          width={SCREEN_W}
          height={SCREEN_H}
          minConfidence={trackingConfig.modelConfig.confidenceThreshold}
          showConfidence={trackingConfig.showConfidence}
        />
      )}

      {/* HUD — scanlines + corner reticles */}
      <HUDOverlay
        width={SCREEN_W}
        height={SCREEN_H}
        showScanlines={showScanlines}
        showReticle
      />

      {/* Top HUD bar */}
      <View style={styles.topBar}>
        <View style={styles.sessionBadge}>
          <Text style={styles.sessionLabel}>[SESSION]</Text>
          <Text style={styles.sessionTime}>{formatTime(sessionTime)}</Text>
          {isRunning && (
            <Animated.Text style={[styles.recDot, { opacity: blinkDot }]}>● REC</Animated.Text>
          )}
        </View>
        <Pressable
          style={styles.flipBtn}
          onPress={() =>
            updateTrackingConfig({
              cameraFacing: trackingConfig.cameraFacing === 'front' ? 'back' : 'front',
            })
          }
        >
          <Icon name="camera-flip-outline" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* Status line */}
      <View style={styles.statusLine}>
        <Text style={[styles.statusText, { color: isRunning ? colors.terminalGreen : colors.textMuted }]}>
          {`> ${status}`}
        </Text>
      </View>

      {/* Rep flash overlay */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.terminalGreen,
            opacity: repFlash,
            pointerEvents: 'none',
          },
        ]}
      />

      {/* Toggle buttons */}
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleBtn, showSkeleton && styles.toggleBtnActive]}
          onPress={() => setShowSkeleton((v) => !v)}
        >
          <Text style={[styles.toggleBtnText, showSkeleton && styles.toggleBtnTextActive]}>
            [SKELETON]
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleBtn, showScanlines && styles.toggleBtnActive]}
          onPress={() => setShowScanlines((v) => !v)}
        >
          <Text style={[styles.toggleBtnText, showScanlines && styles.toggleBtnTextActive]}>
            [SCANLINES]
          </Text>
        </Pressable>
        <Pressable
          style={styles.toggleBtn}
          onPress={() => router.push('/forge/model' as any)}
        >
          <Text style={styles.toggleBtnText}>[CONFIG]</Text>
        </Pressable>
      </View>

      {/* Bottom stats card */}
      <View style={styles.bottomOverlay}>
        <TerminalCard title="LIVE TRACKING" variant={isRunning ? 'glow' : 'default'} style={styles.statsCard} padding={spacing.md}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{liveReps}</Text>
              <Text style={styles.statLabel}>[REPS]</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: formColor }]}>{liveFormScore}%</Text>
              <Text style={styles.statLabel}>[FORM]</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{liveSymmetryScore}%</Text>
              <Text style={styles.statLabel}>[SYM]</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{liveTempo > 0 ? liveTempo.toFixed(1) + 's' : '--'}</Text>
              <Text style={styles.statLabel}>[TEMPO]</Text>
            </View>
          </View>
        </TerminalCard>

        {/* Action button */}
        <Pressable
          style={[styles.actionBtn, isRunning && styles.actionBtnStop]}
          onPress={isRunning ? stopTracking : startTracking}
        >
          <Text style={styles.actionBtnText}>
            {isRunning ? '> STOP_TRACKING' : '> START_TRACKING'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  permissionText: {
    marginVertical: spacing.lg,
    fontSize: 14,
  },
  topBar: {
    position: 'absolute',
    top: 56,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,10,10,0.75)',
    borderWidth: 1,
    borderColor: colors.terminalBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    gap: 8,
  },
  sessionLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  sessionTime: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: colors.textPrimary,
  },
  recDot: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: colors.danger,
    letterSpacing: 1,
  },
  flipBtn: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: 'rgba(10,10,10,0.75)',
    borderWidth: 1,
    borderColor: colors.terminalBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLine: {
    position: 'absolute',
    top: 110,
    left: spacing.lg,
    right: spacing.lg,
  },
  statusText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    letterSpacing: 1,
  },
  toggleRow: {
    position: 'absolute',
    bottom: 220,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  toggleBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.textMuted,
    borderRadius: 3,
    backgroundColor: 'rgba(10,10,10,0.6)',
  },
  toggleBtnActive: {
    borderColor: colors.terminalGreen,
    backgroundColor: 'rgba(0,255,65,0.1)',
  },
  toggleBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: colors.textMuted,
  },
  toggleBtnTextActive: {
    color: colors.terminalGreen,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: spacing.xxl + 16,
    left: spacing.lg,
    right: spacing.lg,
  },
  statsCard: {
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: 'SpaceMono',
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.terminalGreen,
  },
  statLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.terminalBorder,
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: colors.terminalGreen,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(0,255,65,0.08)',
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: 4,
  },
  actionBtnStop: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(255,45,85,0.08)',
  },
  actionBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: colors.terminalGreen,
    letterSpacing: 2,
  },
  termBtn: {
    borderWidth: 1,
    borderColor: colors.terminalGreen,
    borderStyle: 'dashed',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 4,
  },
  termBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: colors.terminalGreen,
    letterSpacing: 1,
  },
});

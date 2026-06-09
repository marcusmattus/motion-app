import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '../../src/lib/theme';
import { HUDOverlay } from '../../src/components/HUDOverlay';
import { PoseSkeleton, Keypoint } from '../../src/components/PoseSkeleton';
import { TerminalCard } from '../../src/components/TerminalCard';
import { useMotionStore, SetRecord } from '../../src/state/store';
import { initPoseDetector, detectPose } from '../../src/vision/poseDetector';
import { processRepFrame, ExerciseId, EXERCISES } from '../../src/vision/repCounter';
import { scoreForm } from '../../src/vision/formScorer';
import { analyzeSymmetry } from '../../src/vision/symmetryAnalyzer';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function SessionScreen() {
  const router = useRouter();
  const {
    trackingConfig,
    addLiveSet,
    addSession,
    resetLiveSession,
    liveReps,
    liveFormScore,
    liveSymmetryScore,
    liveTempo,
    liveSets,
    setLiveReps,
    setLiveFormScore,
    setLiveSymmetryScore,
    setLiveTempo,
  } = useMotionStore();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [keypoints, setKeypoints] = useState<Keypoint[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [currentSetReps, setCurrentSetReps] = useState(0);
  const [currentSetForm, setCurrentSetForm] = useState(0);
  const [currentSetTempo, setCurrentSetTempo] = useState(0);
  const [sets, setSets] = useState<SetRecord[]>([]);
  const [exercise, setExercise] = useState<ExerciseId>(trackingConfig.selectedExercise as ExerciseId);
  const [startTime] = useState(Date.now());

  const repFlash = useRef(new Animated.Value(0)).current;
  const repScale = useRef(new Animated.Value(1)).current;
  const blinkDot = useRef(new Animated.Value(1)).current;
  const detectionRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevReps = useRef(0);
  const sessionId = useRef(`session-${Date.now()}`);

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkDot, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(blinkDot, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [blinkDot]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      await initPoseDetector(trackingConfig.modelConfig);
    })();
    return () => {
      if (detectionRef.current) clearInterval(detectionRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTracking = useCallback(() => {
    prevReps.current = 0;
    setCurrentSetReps(0);
    setCurrentSetForm(0);
    setIsTracking(true);
    timerRef.current = setInterval(() => setSessionTime((t) => t + 1), 1000);

    detectionRef.current = setInterval(async () => {
      const result = await detectPose();
      if (!result) return;
      const mapped: Keypoint[] = result.keypoints.map((k) => ({ ...k }));
      setKeypoints(mapped);
      const repUpdate = processRepFrame(result.keypoints, exercise, sessionId.current);
      const form = scoreForm(result.keypoints, exercise);
      const sym = analyzeSymmetry(result.keypoints);
      setLiveReps(repUpdate.reps);
      setLiveFormScore(form.score);
      setLiveSymmetryScore(sym.overallScore);
      setLiveTempo(repUpdate.avgTempo);
      setCurrentSetReps(repUpdate.reps);
      setCurrentSetForm(form.score);
      setCurrentSetTempo(repUpdate.avgTempo);
      if (repUpdate.reps > prevReps.current) {
        prevReps.current = repUpdate.reps;
        Animated.parallel([
          Animated.sequence([
            Animated.timing(repFlash, { toValue: 1, duration: 60, useNativeDriver: true }),
            Animated.timing(repFlash, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(repScale, { toValue: 1.3, duration: 80, useNativeDriver: true }),
            Animated.timing(repScale, { toValue: 1, duration: 300, useNativeDriver: true }),
          ]),
        ]).start();
      }
    }, 500);
  }, [exercise, repFlash, repScale, setLiveReps, setLiveFormScore, setLiveSymmetryScore, setLiveTempo]);

  const endSet = useCallback(() => {
    if (detectionRef.current) clearInterval(detectionRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTracking(false);
    const newSet: SetRecord = {
      setNumber: sets.length + 1,
      reps: currentSetReps,
      formScore: currentSetForm,
      avgTempo: currentSetTempo,
      timestamp: Date.now(),
    };
    setSets((prev) => [...prev, newSet]);
    addLiveSet(newSet);
    prevReps.current = 0;
    setCurrentSetReps(0);
    setCurrentSetForm(0);
    setCurrentSetTempo(0);
  }, [sets, currentSetReps, currentSetForm, currentSetTempo, addLiveSet]);

  const finishSession = useCallback(() => {
    if (isTracking) endSet();
    const allSets = [...sets];
    const totalReps = allSets.reduce((s, st) => s + st.reps, 0);
    const avgForm =
      allSets.length > 0
        ? Math.round(allSets.reduce((s, st) => s + st.formScore, 0) / allSets.length)
        : 0;
    addSession({
      id: sessionId.current,
      exerciseId: exercise,
      sets: allSets,
      startTime,
      endTime: Date.now(),
      avgFormScore: avgForm,
      totalReps,
      symmetryScore: liveSymmetryScore,
    });
    resetLiveSession();
    router.push('/debrief' as any);
  }, [isTracking, sets, exercise, startTime, liveSymmetryScore, addSession, resetLiveSession, endSet, router]);

  const formatTime = (secs: number) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const formColor = (s: number) =>
    s >= 80 ? colors.terminalGreen : s >= 55 ? colors.terminalAmber : colors.danger;

  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Icon name="camera-off" size={48} color={colors.textMuted} />
        <Text style={styles.permText}>CAMERA_ACCESS_DENIED</Text>
        <Pressable
          style={styles.termBtn}
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
          }}
        >
          <Text style={styles.termBtnText}>{`> GRANT_ACCESS`}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Camera */}
      <Camera style={styles.camera} type={CameraType.front} />

      {/* Skeleton */}
      {trackingConfig.showSkeleton && keypoints.length > 0 && (
        <PoseSkeleton keypoints={keypoints} width={SCREEN_W} height={SCREEN_H} minConfidence={trackingConfig.modelConfig.confidenceThreshold} />
      )}

      <HUDOverlay width={SCREEN_W} height={SCREEN_H} showScanlines={trackingConfig.showScanlines} showReticle />

      {/* Rep flash */}
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.terminalGreen, opacity: repFlash, pointerEvents: 'none' }]} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.sessionInfo}>
          <Text style={styles.exerciseName}>[{exercise.replace('_', ' ')}]</Text>
          <Text style={styles.sessionTimer}>{formatTime(sessionTime)}</Text>
          {isTracking && (
            <Animated.Text style={[styles.recDot, { opacity: blinkDot }]}>● REC</Animated.Text>
          )}
        </View>
        <Pressable style={styles.endBtn} onPress={finishSession}>
          <Text style={styles.endBtnText}>[END]</Text>
        </Pressable>
      </View>

      {/* Large rep counter */}
      <View style={styles.repCounterContainer}>
        <Animated.Text style={[styles.repCount, { transform: [{ scale: repScale }] }]}>
          {currentSetReps}
        </Animated.Text>
        <Text style={styles.repLabel}>[REPS]</Text>
      </View>

      {/* Set log sidebar */}
      <View style={styles.setLog}>
        {sets.slice(-4).map((s, i) => (
          <Text key={i} style={styles.setLogRow}>
            {`SET_${String(s.setNumber).padStart(2, '0')} | ${s.reps}r | ${s.formScore}% | ${s.avgTempo > 0 ? s.avgTempo.toFixed(1) + 's' : '--'}`}
          </Text>
        ))}
        {isTracking && (
          <Text style={styles.setLogActive}>
            {`SET_${String(sets.length + 1).padStart(2, '0')} | ▮`}
          </Text>
        )}
      </View>

      {/* Bottom stats + actions */}
      <View style={styles.bottomPanel}>
        <TerminalCard style={styles.statsCard} padding={spacing.sm}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statV, { color: formColor(currentSetForm) }]}>{currentSetForm}%</Text>
              <Text style={styles.statL}>[FORM]</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.stat}>
              <Text style={styles.statV}>{liveSymmetryScore}%</Text>
              <Text style={styles.statL}>[SYM]</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.stat}>
              <Text style={styles.statV}>{currentSetTempo > 0 ? currentSetTempo.toFixed(1) + 's' : '--'}</Text>
              <Text style={styles.statL}>[TEMPO]</Text>
            </View>
          </View>
        </TerminalCard>

        <View style={styles.actionRow}>
          {!isTracking ? (
            <Pressable style={[styles.actionBtn, styles.actionBtnGreen]} onPress={startTracking}>
              <Text style={[styles.actionBtnText, { color: colors.terminalGreen }]}>{`> START_SET`}</Text>
            </Pressable>
          ) : (
            <Pressable style={[styles.actionBtn, styles.actionBtnAmber]} onPress={endSet}>
              <Text style={[styles.actionBtnText, { color: colors.terminalAmber }]}>{`> END_SET`}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  camera: { ...StyleSheet.absoluteFillObject },
  centered: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  permText: { fontFamily: 'SpaceMono', fontSize: 13, color: colors.textMuted, marginVertical: spacing.lg },
  topBar: { position: 'absolute', top: 56, left: spacing.lg, right: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sessionInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(10,10,10,0.75)', borderWidth: 1, borderColor: colors.terminalBorder, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 4, gap: 8 },
  exerciseName: { fontFamily: 'SpaceMono', fontSize: 10, color: colors.terminalGreen, letterSpacing: 1 },
  sessionTimer: { fontFamily: 'SpaceMono', fontSize: 14, color: colors.textPrimary },
  recDot: { fontFamily: 'SpaceMono', fontSize: 10, color: colors.danger },
  endBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderWidth: 1, borderColor: colors.danger, borderRadius: 4, backgroundColor: 'rgba(255,45,85,0.08)' },
  endBtnText: { fontFamily: 'SpaceMono', fontSize: 10, color: colors.danger },
  repCounterContainer: { position: 'absolute', top: '35%', alignSelf: 'center', alignItems: 'center' },
  repCount: { fontFamily: 'SpaceMono', fontSize: 96, fontWeight: 'bold', color: colors.terminalGreen, textShadowColor: colors.terminalGreen, textShadowRadius: 30 },
  repLabel: { fontFamily: 'SpaceMono', fontSize: 11, color: colors.textMuted, letterSpacing: 3, marginTop: -spacing.sm },
  setLog: { position: 'absolute', top: 130, left: spacing.lg, backgroundColor: 'rgba(10,10,10,0.6)', borderWidth: 1, borderColor: colors.terminalBorder, padding: spacing.sm, borderRadius: 4, maxWidth: SCREEN_W * 0.6 },
  setLogRow: { fontFamily: 'SpaceMono', fontSize: 9, color: colors.textMuted, marginBottom: 2 },
  setLogActive: { fontFamily: 'SpaceMono', fontSize: 9, color: colors.terminalGreen },
  bottomPanel: { position: 'absolute', bottom: spacing.xxl, left: spacing.lg, right: spacing.lg },
  statsCard: { marginBottom: spacing.sm },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  stat: { alignItems: 'center', flex: 1 },
  statV: { fontFamily: 'SpaceMono', fontSize: 18, fontWeight: 'bold', color: colors.terminalGreen },
  statL: { fontFamily: 'SpaceMono', fontSize: 8, color: colors.textMuted, letterSpacing: 1, marginTop: 2 },
  statDiv: { width: 1, height: 30, backgroundColor: colors.terminalBorder },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderRadius: 4 },
  actionBtnGreen: { borderColor: colors.terminalGreen, backgroundColor: 'rgba(0,255,65,0.08)' },
  actionBtnAmber: { borderColor: colors.terminalAmber, backgroundColor: 'rgba(255,184,0,0.08)' },
  actionBtnText: { fontFamily: 'SpaceMono', fontSize: 13, letterSpacing: 2 },
  termBtn: { borderWidth: 1, borderColor: colors.terminalGreen, borderStyle: 'dashed', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: 4 },
  termBtnText: { fontFamily: 'SpaceMono', fontSize: 13, color: colors.terminalGreen, letterSpacing: 1 },
});

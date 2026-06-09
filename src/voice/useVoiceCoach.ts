// src/voice/useVoiceCoach.ts
// Orchestrator hook. Feed it pose frames; it runs the reflex layer (poseRules),
// speaks cues (debounced), counts reps, and — crucially for the report — tallies
// each rep's active cues into the store on completion. That per-rep tally is what
// lets the debrief say "go deeper · 6/10 reps" instead of a vague score.

import { useCallback, useRef } from 'react';
import { useSession } from '../state/sessionStore';
import { Pose } from '../vision/landmarks';
import { EXERCISES, analyze, countRep, RepPhase, Cue } from '../vision/poseRules';
import { deriveThresholds } from '../vision/calibration';
import { say } from './speech';

// Don't repeat the same spoken cue more often than this (ms).
const CUE_COOLDOWN = 3500;

export function useVoiceCoach() {
  const { exercise, calibration, active, pushRep, logRepCues, setLive } = useSession();

  const phase = useRef<RepPhase>('up');
  const lastSpokenAt = useRef<Record<string, number>>({});
  // Cues seen during the current (in-progress) rep, de-duped by id.
  const repCues = useRef<Map<string, Cue>>(new Map());
  // Worst (lowest) frame score during the current rep defines the rep's score.
  const repWorstScore = useRef<number>(100);

  const onFrame = useCallback(
    (pose: Pose, quality = 1) => {
      if (!active) return;
      const def = EXERCISES[exercise];
      const th = deriveThresholds(calibration, exercise);
      const { driverAngle, formScore, cues } = analyze(def, pose, th);

      if (driverAngle == null) {
        setLive(formScore, quality);
        return;
      }

      setLive(formScore, quality);

      // Accumulate this rep's cues + track its worst moment.
      for (const c of cues) {
        repCues.current.set(c.id, c);
        // Speak, debounced per cue id; critical cues cut the queue.
        const now = Date.now();
        if (now - (lastSpokenAt.current[c.id] ?? 0) > CUE_COOLDOWN) {
          lastSpokenAt.current[c.id] = now;
          say(c.text, c.severity === 'critical' ? 'critical' : 'normal');
        }
      }
      repWorstScore.current = Math.min(repWorstScore.current, formScore);

      // Rep state machine.
      const next = countRep(driverAngle, phase.current, th);
      phase.current = next.phase;
      if (next.completed) {
        pushRep(repWorstScore.current);
        logRepCues(Array.from(repCues.current.values()).map((c) => ({
          id: c.id, text: c.text, severity: c.severity,
        })));
        repCues.current.clear();
        repWorstScore.current = 100;
      }
    },
    [active, exercise, calibration, pushRep, logRepCues, setLive],
  );

  return { onFrame };
}

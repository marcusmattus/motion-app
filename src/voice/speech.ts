// src/voice/speech.ts
// TTS queue + STT lifecycle. The coach can speak a stream of short cues without
// them stomping each other; a `critical` line cuts the queue so safety cues land
// immediately. STT is wrapped behind a tiny interface so the rest of the app
// doesn't depend on the native module directly (and tests can stub it).

import * as Speech from 'expo-speech';

type Priority = 'low' | 'normal' | 'critical';
interface Utterance { text: string; priority: Priority }

let queue: Utterance[] = [];
let speaking = false;

function pump() {
  if (speaking) return;
  const next = queue.shift();
  if (!next) return;
  speaking = true;
  Speech.speak(next.text, {
    rate: 1.0,
    pitch: 1.0,
    onDone: () => { speaking = false; pump(); },
    onStopped: () => { speaking = false; pump(); },
    onError: () => { speaking = false; pump(); },
  });
}

/** Queue a line to be spoken. `critical` flushes anything pending. */
export function say(text: string, priority: Priority = 'normal') {
  if (!text) return;
  if (priority === 'critical') {
    queue = [];
    Speech.stop();
    speaking = false;
  }
  // De-dupe an identical line already queued (avoid nagging the same cue).
  if (queue.some((u) => u.text === text)) return;
  queue.push({ text, priority });
  pump();
}

/** Hard stop — clears the queue and silences current speech. */
export function shutUp() {
  queue = [];
  Speech.stop();
  speaking = false;
}

// ---- STT lifecycle (thin, swappable) ----
// expo-speech-recognition is a native module; we keep the surface minimal so
// callers (useVoiceCoach) don't import it directly. Wire the real recognizer in
// here when running a dev build.
export interface Recognizer {
  start: () => void;
  stop: () => void;
}

let recognizer: Recognizer | null = null;
export function setRecognizer(r: Recognizer | null) { recognizer = r; }
export function startListening() { recognizer?.start(); }
export function stopListening() { recognizer?.stop(); }

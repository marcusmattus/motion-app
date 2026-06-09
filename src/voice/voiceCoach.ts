// src/voice/voiceCoach.ts
// The agent brain. Two tiers:
//   1. Local intent router — instant answers to common asks, zero network.
//   2. LLM bridge — natural conversation + end-of-set summaries via your backend.
// The hot per-frame coaching lives in poseRules (reflex layer); this file is the
// "talk to me" layer that runs on user speech or session events.

import { ExerciseId, EXERCISES } from '../vision/poseRules';

export interface CoachContext {
  exercise: ExerciseId;
  reps: number;
  avgForm: number;
  currentFormScore: number;
  consistency: number;
  trackingQuality: number;
  activeCues: string[]; // human-readable cue texts currently firing
}

export interface CoachReply { speak: string; priority: 'low' | 'normal' | 'critical' }

// ---- Tier 1: local intent router (synchronous, offline) ----
export function routeIntent(utterance: string, ctx: CoachContext): CoachReply | null {
  const u = utterance.toLowerCase();

  const has = (...words: string[]) => words.some((w) => u.includes(w));

  if (has('how many', 'rep count', 'count')) {
    return { speak: `${ctx.reps} reps so far.`, priority: 'normal' };
  }
  if (has('how am i', "how's my form", 'how is my form', 'form')) {
    const verdict = ctx.avgForm >= 85 ? 'looking sharp' : ctx.avgForm >= 70 ? 'solid, tighten it up' : 'needs work';
    const fix = ctx.activeCues[0] ? ` Main thing: ${ctx.activeCues[0]}.` : '';
    return { speak: `Form's at ${ctx.avgForm} percent, ${verdict}.${fix}`, priority: 'normal' };
  }
  if (has("what's next", 'whats next', 'next exercise', 'what now')) {
    return { speak: `Finish your set, then we'll review. ${EXERCISES[ctx.exercise].label} reps are logging clean.`, priority: 'low' };
  }
  if (has('stop', 'end set', 'finish', 'done')) {
    return { speak: `Ending the set. ${ctx.reps} reps at ${ctx.avgForm} percent average.`, priority: 'normal' };
  }
  if (has('reset', 'start over', 'restart')) {
    return { speak: 'Reset. Counter back to zero.', priority: 'normal' };
  }
  if (has('quiet', 'shut up', 'silence', 'mute')) {
    return { speak: 'Going quiet. Say "coach" when you need me.', priority: 'normal' };
  }
  return null; // fall through to LLM
}

// ---- Tier 2: LLM bridge ----
// Calls YOUR backend (Supabase edge fn / API route) which holds the Anthropic key.
// Never embed the key in the app. See supabase/functions/coach.
export async function askCoach(
  endpoint: string,
  utterance: string,
  ctx: CoachContext,
  authToken?: string,
): Promise<CoachReply> {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({ utterance, context: ctx }),
    });
    if (!res.ok) throw new Error(`coach ${res.status}`);
    const data = await res.json();
    return { speak: data.reply ?? "Didn't catch that — try again.", priority: 'normal' };
  } catch {
    // Graceful offline fallback.
    return { speak: "I can't reach the coach right now, but keep your reps controlled.", priority: 'low' };
  }
}

// System prompt for the backend to use (kept here so app + server stay in sync).
export const COACH_SYSTEM_PROMPT = `You are FORMA, a terse, encouraging strength coach speaking OUT LOUD during a live set.
Rules:
- One or two short sentences. No lists, no markdown. This is spoken aloud.
- Use the provided live metrics; never invent numbers.
- Be specific and physical ("drive through your heels"), not generic.
- If form is good, say so briefly and move on. Don't over-coach.`;

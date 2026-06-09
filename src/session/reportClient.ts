// src/session/reportClient.ts
// End-of-set debrief client. Calls the `report` edge function (which holds the
// Anthropic key) for a spoken summary + corrective drills + a next-session
// target. If the backend is unreachable or returns junk, a deterministic local
// report fills in from a built-in drill library keyed to cue ids, so the report
// screen is never empty.

import { SessionSummary } from './analytics';

export interface SessionReport {
  summary: string;     // 1-2 sentences, read aloud
  drills: string[];    // 2-3 corrective drills
  nextTarget: string;  // one concrete, measurable goal
  source: 'ai' | 'local';
}

// Drills keyed to the cue ids fired by poseRules.analyze().
const DRILL_LIBRARY: Record<string, string[]> = {
  depth: [
    'Box squats to a target just below parallel — own the depth.',
    'Tempo reps: 3 seconds down, pause 1 second at the bottom.',
  ],
  back: [
    'Bird-dogs, 2×10/side, to groove a braced neutral spine.',
    'Light RDLs focusing on a flat back through the full range.',
  ],
  lockout: [
    'Pin presses from the sticking point to drill full lockout.',
    'Overhead holds, 3×20s, at the top position.',
  ],
  tempo: [
    'Paused reps with a 2-second eccentric to kill the bounce.',
    'Tempo work at 70% to rebuild control before adding load.',
  ],
};

const GENERIC_DRILLS = [
  'Film one set from the side and review it before the next session.',
  'Drop 10% load and chase clean, controlled reps.',
];

/** Deterministic offline debrief — used when the backend is unreachable. */
export function localReport(s: SessionSummary): SessionReport {
  const verdict =
    s.avgForm >= 85 ? 'Sharp set' : s.avgForm >= 70 ? 'Solid set' : 'Rough set';
  const fatigueNote =
    s.fatiguePer10 <= -8
      ? ` Form fell off ${Math.abs(s.fatiguePer10)} points across the set — fatigue crept in.`
      : s.fatiguePer10 >= 5
        ? ' You actually tightened up as you went — good warm-up effect.'
        : ' You held form steady throughout.';
  const deltaNote =
    s.deltaVsLast == null
      ? ''
      : s.deltaVsLast >= 0
        ? ` Up ${s.deltaVsLast}% on your last ${s.exerciseLabel} set.`
        : ` Down ${Math.abs(s.deltaVsLast)}% from last time.`;

  const summary =
    `${verdict} on ${s.exerciseLabel}: ${s.reps} reps at ${s.avgForm}% average ` +
    `form, ${s.consistency}% consistency.${fatigueNote}${deltaNote}`;

  // Drills tied to the actual top issues; fall back to generic if clean.
  const drills: string[] = [];
  for (const issue of s.topIssues) {
    const lib = DRILL_LIBRARY[issue.id];
    if (lib && drills.length < 3) drills.push(lib[0]);
  }
  if (drills.length === 0) drills.push(...GENERIC_DRILLS.slice(0, 2));

  // Next target: nudge the dominant fault, else push volume/quality.
  const worst = s.topIssues[0];
  const nextTarget = worst
    ? `Next ${s.exerciseLabel}: cut "${worst.text}" from ${worst.count}/${worst.totalReps} reps to under ${Math.max(1, Math.floor(worst.count / 2))}.`
    : `Next ${s.exerciseLabel}: add a rep or 5% load while holding ${s.avgForm}%+ form.`;

  return { summary, drills: drills.slice(0, 3), nextTarget, source: 'local' };
}

function isValid(r: any): r is { summary: string; drills: string[]; nextTarget: string } {
  return (
    r &&
    typeof r.summary === 'string' && r.summary.length > 0 &&
    Array.isArray(r.drills) && r.drills.length > 0 &&
    typeof r.nextTarget === 'string' && r.nextTarget.length > 0
  );
}

/**
 * Fetch the AI debrief. Always resolves — on any failure (network, non-200,
 * empty/invalid JSON) it returns the deterministic local report.
 */
export async function fetchReport(
  endpoint: string | undefined,
  summary: SessionSummary,
  authToken?: string,
): Promise<SessionReport> {
  if (!endpoint) return localReport(summary);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({ summary }),
    });
    if (!res.ok) throw new Error(`report ${res.status}`);
    const data = await res.json();
    if (!isValid(data)) throw new Error('invalid report payload');
    return { summary: data.summary, drills: data.drills.slice(0, 3), nextTarget: data.nextTarget, source: 'ai' };
  } catch {
    return localReport(summary);
  }
}

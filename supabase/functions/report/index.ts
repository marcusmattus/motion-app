// supabase/functions/report/index.ts
// Structured end-of-set report. Returns { summary, drills[], nextTarget }.
// Deploy: supabase functions deploy report
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const SYSTEM = `You are FORMA, a strength coach writing a short post-set debrief.
Return ONLY valid JSON, no markdown, matching:
{"summary": string, "drills": string[], "nextTarget": string}
Rules:
- summary: 1-2 sentences, will be read ALOUD. Reference the real metrics.
- drills: 2-3 specific corrective drills tied to the athlete's top issues.
- nextTarget: one concrete, measurable goal for next session.
- Never invent numbers; use only what's provided.`;

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  try {
    const { summary } = await req.json();

    const user = `Session data (JSON): ${JSON.stringify(summary)}.
Write the debrief as JSON.`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system: SYSTEM,
        messages: [{ role: 'user', content: user }],
      }),
    });

    const data = await res.json();
    const text = (data?.content ?? [])
      .filter((b: any) => b.type === 'text').map((b: any) => b.text).join('').trim();

    // strip any stray code fences, then parse
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json' } });
  } catch {
    // Let the client fall back to its local report.
    return new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
});

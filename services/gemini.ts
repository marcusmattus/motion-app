const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

type MacroRow = { label: string; value: string };

export async function analyzeNutrition(base64: string): Promise<MacroRow[]> {
  if (!base64) {
    throw new Error('Missing image data');
  }

  const apiKey = process.env.EXPO_PUBLIC_GEMINI_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is required. Set EXPO_PUBLIC_GEMINI_KEY.');
  }

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: 'Analyze this meal photo and return calories, protein, carbs, fats in JSON array of {{label, value}}.'
            },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64
              }
            }
          ]
        }
      ]
    })
  });

  if (!res.ok) {
    throw new Error(`Gemini error ${res.status}: ${res.statusText}`);
  }

  const payload = await res.json();
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  try {
    return JSON.parse(text);
  } catch (error) {
    return [
      { label: 'Calories', value: '—' },
      { label: 'Protein', value: '—' },
      { label: 'Carbs', value: '—' },
      { label: 'Fats', value: '—' }
    ];
  }
}

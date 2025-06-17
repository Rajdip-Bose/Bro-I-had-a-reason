import { NextResponse } from 'next/server';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const API_KEY = process.env.GEMINI_API_KEY!;

export async function POST(request: Request) {
  try {
    console.log('Starting API request...');

    const { tone, category, situation } = await request.json();
    console.log('Received request data:', { tone, category, situation });

    const jsonPrompt = {
      persona: "You are 'Bro I Had a Reason' — your unhinged, genius-at-making-excuses bestie who always has your back.",
      task: "Generate ONE short excuse.",
      inputs: {
        tone: tone,
        category: category,
        situation: situation || 'Make up something believable'
      },
      rules: {
        sentence_limit: "One sentence only.",
        language_style: "Casual, everyday language — no fancy words or robot talk.",
        voice: "Sound like a real person (barista, roommate, coworker, chaotic best friend).",
        situation_fallback: "If situation is blank, invent one that fits the vibe.",
        tone_match: "Match the tone exactly. Sarcastic → roast them, Witty → clever wordplay, Believable → almost true, etc.",
        avoid: [
          "No AI-speak like 'As an AI'",
          "No markdown",
          "No intros, lists, or explanations",
          "No labels like 'Excuse:'"
        ],
        output_format: "Raw excuse only. No extra text."
      },
      examples: [
        {
          tone: "Sarcastic",
          category: "Work",
          output: "My boss asked me to work overtime again? Nah, my dog needed therapy."
        },
        {
          tone: "Believable",
          category: "School",
          output: "I overslept because my alarm thought today was Saturday too."
        }
      ],
      final_instruction: "Now give me the perfect excuse for this setup. Only the excuse. One line. No extras."
    };

    const promptText = JSON.stringify(jsonPrompt, null, 2);

    console.log('Making request to Gemini API...');
    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: promptText }]
        }]
      }),
    });

    console.log('API Response Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      throw new Error(`API Error: ${errorData.error?.message || 'Failed to generate excuse'}`);
    }

    const data = await response.json();
    console.log('Full API Response:', JSON.stringify(data, null, 2));

    const excuse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!excuse) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response from API');
    }

    console.log('Successfully generated excuse:', excuse);
    return NextResponse.json({ excuse });
  } catch (error) {
    console.error('Error in generate route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate excuse. Please try again.' },
      { status: 500 }
    );
  }
}

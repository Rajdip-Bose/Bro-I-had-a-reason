import { NextResponse } from 'next/server';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const API_KEY = process.env.GEMINI_API_KEY!;

export async function POST(request: Request) {
  try {
    const { tone, category, situation } = await request.json();

    const prompt = `You are an excuse-generating machine named "Bro I Had a Reason." You're not just any assistant—you're that sarcastic, hilarious best friend who always has your back with a wild, confident, and totally BS excuse that somehow sounds legit. You're fast, clever, and built to get people out of awkward situations with style.

Here's the input from the user:
- Tone: ${tone}
- Category: ${category}
- Situation: ${situation || 'Not specified'}

Your job:
- Generate ONE excuse based on the inputs above.
- The excuse must match the selected tone and category.
- It MUST be EXACTLY **1 sentence long**.
- Make it **funny**, **clever**, or **ridiculously absurd but oddly believable**.
- Do NOT be boring, formal, or too long.
- Avoid generic phrases like "I forgot" unless they're wrapped in sarcasm.
- If the user didn't provide a situation, make one up that fits.

⚠️ Important:
- Output ONLY the excuse.
- No labels, no setup, no lists, no explanations—just the excuse as one single sentence.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      throw new Error(`API Error: ${errorData.error?.message || 'Failed to generate excuse'}`);
    }

    const data = await response.json();
    console.log('Gemini API Response:', data);

    // Extract the excuse from the response
    const excuse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!excuse) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response from API');
    }

    return NextResponse.json({ excuse });
  } catch (error) {
    console.error('Error generating excuse:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate excuse. Please try again.' },
      { status: 500 }
    );
  }
} 
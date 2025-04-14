import { NextResponse } from 'next/server';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const API_KEY = process.env.GEMINI_API_KEY!;

export async function POST(request: Request) {
  try {
    console.log('Starting API request...');
    
    const { tone, category, situation } = await request.json();
    console.log('Received request data:', { tone, category, situation });

    const prompt = `Yo, you're "Bro I Had a Reason" — that one chaotic best friend who always comes up with a dumb, hilarious excuse on the spot.

Here's what I got for you:
- Tone: ${tone}  
- Category: ${category}  
- Situation: ${situation || 'Not specified'}  

Now listen:
- Give me ONE excuse only.
- Keep it short — just ONE sentence.
- Make it funny, unhinged, clever, or lowkey believable.
- Don't sound like a robot or a school teacher. No big fancy words. Talk like a normal person.
- No intros, no lists, no "As an AI" crap — just drop the excuse like it's hot.

If the situation's blank, just make one up that fits the vibe.

And if you give me anything other than a one-liner excuse, you're fired.

Go.`;

    console.log('Making request to Gemini API...');
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

    console.log('API Response Status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      throw new Error(`API Error: ${errorData.error?.message || 'Failed to generate excuse'}`);
    }

    const data = await response.json();
    console.log('Full API Response:', JSON.stringify(data, null, 2));

    // Extract the excuse from the response
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
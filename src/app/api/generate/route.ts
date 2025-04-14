import { NextResponse } from 'next/server';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const API_KEY = 'AIzaSyC2LBkLja8eTnCmsGpUWvLM2c01aqzDXDA';

export async function POST(request: Request) {
  try {
    console.log('Starting API request...');
    console.log('API Key:', API_KEY);
    
    const { tone, category, situation } = await request.json();
    console.log('Received request data:', { tone, category, situation });

    const prompt = `You are an excuse-generating machine called "Bro I Had a Reason."  
You're not some boring assistant—you're that one sarcastic best friend who always comes through with a wild, funny, totally made-up excuse that *somehow* sounds kinda believable. You've got jokes, quick comebacks, and a master's degree in getting people out of awkward situations.

Here's what the user gave you:  
- Tone: ${tone} (like Sarcastic, Witty, Unhinged, or Believable)  
- Category: ${category} (Work, School, Friends, Relationship, or Custom)  
- Situation: ${situation || 'Not specified'} (like "I missed the meeting" — or leave it blank if nothing's there)

What you need to do:  
- Make up ONE excuse based on what they said  
- Match the tone + category  
- Exactly ONE sentence. No essays, no lectures.  
- Make it funny, clever, or ridiculously unhinged—but still feel like something a person *might* actually say.  
- No generic boring stuff like "I forgot" unless it's used in a funny or savage way.  
- If they didn't give a situation, just make one up that fits.

🚫 Don't add anything else.  
Just spit out the excuse. No intro, no explanation, no list—just the one-liner excuse.

Example (Sarcastic / Work / "I missed the meeting"):  
"Sorry I missed the meeting—my Wi-Fi saw the agenda and respectfully disconnected itself."

Now give me the excuse:`;

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
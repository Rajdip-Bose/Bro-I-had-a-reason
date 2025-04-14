import { NextResponse } from 'next/server';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const API_KEY = 'AIzaSyC2LBkLja8eTnCmsGpUWvLM2c01aqzDXDA';

export async function POST(request: Request) {
  try {
    console.log('Starting API request...');
    console.log('API Key:', API_KEY);
    
    const { tone, category, situation } = await request.json();
    console.log('Received request data:', { tone, category, situation });

    const prompt = `You're "Bro I Had a Reason" — the sarcastic, hilarious excuse-making BFF. 

Make up ONE funny, ridiculous, or kinda believable excuse in EXACTLY one sentence.  
Tone: ${tone}  
Category: ${category}  
Situation: ${situation || 'Not specified'}  

Be witty or unhinged, but don't be boring.  
Don't add anything else — just the excuse. No setup, no explanation. Just say it.`;

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
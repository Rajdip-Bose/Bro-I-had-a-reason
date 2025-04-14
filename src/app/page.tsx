'use client';

import { useState } from 'react';

const tones = ['Sarcastic', 'Witty', 'Unhinged', 'Believable'];
const categories = ['Work', 'School', 'Friends', 'Relationships', 'Custom'];

export default function Home() {
  const [tone, setTone] = useState('');
  const [category, setCategory] = useState('');
  const [situation, setSituation] = useState('');
  const [excuse, setExcuse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const generateExcuse = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tone,
          category,
          situation: situation || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate excuse');
      }

      const data = await response.json();
      setExcuse(data.excuse);
    } catch (err) {
      setError('Failed to generate excuse. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold font-poppins text-indigo-900 mb-4">
          Bro I Had a Reason
        </h1>
        <p className="text-xl text-indigo-700 font-poppins">
          Because owning up to stuff is overrated.
        </p>
      </div>

      <div className="w-full space-y-6 bg-white p-8 rounded-2xl shadow-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a tone</option>
              {tones.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Situation (Optional)
            </label>
            <input
              type="text"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="Describe your situation..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          onClick={generateExcuse}
          disabled={!tone || !category || isGenerating}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${
            !tone || !category || isGenerating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isGenerating ? 'Generating...' : 'GENERATE EXCUSE'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {excuse && (
          <div className="mt-8 p-6 bg-indigo-50 rounded-xl border-2 border-indigo-200 animate-fade-in">
            <p className="text-indigo-900 text-lg">{excuse}</p>
          </div>
        )}
      </div>
    </main>
  );
}

'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';

const tones = ['Sarcastic', 'Witty', 'Unhinged', 'Believable', 'Clown-certified'];
const categories = ['Work', 'School', 'Friends', 'Relationships', 'Custom'];

// Simple Toast Notification Component
function Toast({ message, show }: { message: string; show: boolean }) {
  return (
    <div
      className={`fixed bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
    >
      {message}
    </div>
  );
}

export default function Home() {
  const canvasRef = useRef(null);
  const blobPoints = 60;

  // Form State
  const [tone, setTone] = useState('');
  const [category, setCategory] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form');
  const [excuse, setExcuse] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Placeholder Cycling
  const teaPlaceholders = useMemo(() => [
    "I skipped work to play Minecraft",
    "I was ‘asleep’ during our meeting",
    "I forgot my own birthday",
    "I fell in love with a traffic cone",
    "I joined a cult by accident"
  ], []);

  const [placeholder, setPlaceholder] = useState(teaPlaceholders[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder(prev => {
        const index = (teaPlaceholders.indexOf(prev) + 1) % teaPlaceholders.length;
        return teaPlaceholders[index];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [teaPlaceholders]);

  // Prevent text selection
  useEffect(() => {
    const preventSelection = () => {
      const selection = window.getSelection();
      if (selection) selection.empty();
    };

    document.body.style.userSelect = 'none';
    // document.body.style.webkitUserSelect = 'none';
    // document.body.style.msUserSelect = 'none';
    // document.body.style.mozUserSelect = 'none';

    document.addEventListener('selectstart', preventSelection);
    return () => document.removeEventListener('selectstart', preventSelection);
  }, []);


  // Canvas Blob Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = (canvas as HTMLCanvasElement).getContext('2d');
    if (!ctx) return;

    let width = (canvas as HTMLCanvasElement).width = window.innerWidth;
    let height = (canvas as HTMLCanvasElement).height = window.innerHeight;
    let time = 0;

    function drawBlob() {
      const bgGradient = ctx!.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 1.4);
      bgGradient.addColorStop(0, '#050505');
      bgGradient.addColorStop(0.5, '#0f0f0f');
      bgGradient.addColorStop(1, '#1e1e1e');
      ctx!.fillStyle = bgGradient;
      ctx!.fillRect(0, 0, width, height);

      const minDim = Math.min(width, height);
      const baseRadius = minDim * 0.4;
      const centerX = width / 2 + Math.sin(time * 0.003) * 40 + Math.cos(time * 0.007) * 20;
      const centerY = height / 2 + Math.cos(time * 0.005) * 30 + Math.sin(time * 0.009) * 20;

      ctx!.beginPath();
      for (let i = 0; i <= blobPoints; i++) {
        const angle = (i / blobPoints) * Math.PI * 2;
        const wave = Math.sin(angle + time * 0.008) * 25 +
          Math.cos(angle * 2 + time * 0.01) * 15 +
          Math.sin(angle * 3 + time * 0.006) * 10;
        const radius = baseRadius + wave;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        if (i === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.closePath();

      const gradient = ctx!.createRadialGradient(
        centerX - 30,
        centerY - 30,
        baseRadius * 0.3,
        centerX,
        centerY,
        baseRadius * 1.3
      );
      gradient.addColorStop(0, '#a5f3fc');
      gradient.addColorStop(0.5, '#3b82f6');
      gradient.addColorStop(1, '#1e3a8a');

      ctx!.fillStyle = gradient;
      ctx!.fill();

      ctx!.shadowBlur = 25;
      ctx!.shadowColor = 'rgba(59, 130, 246, 0.7)';
      ctx!.strokeStyle = 'rgba(59, 130, 246, 0.9)';
      ctx!.lineWidth = 2.5;
      ctx!.stroke();
      ctx!.shadowBlur = 0;

      time += 1;
      requestAnimationFrame(drawBlob);
    }

    drawBlob();

    const resizeCanvas = () => {
      width = (canvas as HTMLCanvasElement).width = window.innerWidth;
      height = (canvas as HTMLCanvasElement).height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Revert to "form" step if any field changes after result
  useEffect(() => {
    if (step === 'result') {
      setStep('form');
    }
  }, [tone, category, customReason]);

// Real API Call
const generateExcuse = async () => {
  setStep('loading');
  const loadingMessages = [
    "Rolling the dice of fate",
    "Consulting the council of goblins",
    "Gaslighting in progress",
    "Summoning chaotic energy",
    "Rewriting history creatively"
  ];

  // Pick a random message
  const selectedMessage = loadingMessages[
    Math.floor(Math.random() * loadingMessages.length)
  ];

  // Show full message with ...
  setLoadingMessage(`${selectedMessage}...`);

  // Wait 1 second, then make API call
  setTimeout(() => {
    fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tone, category, situation: customReason }),
    })
      .then(res => res.json())
      .then(data => {
        setExcuse(data.excuse);
        setStep('result');
      })
      .catch(err => {
        console.error('API Error:', err);
        setError('Error generating excuse. Please try again.');
        setStep('form');
      });
  }, 1000);
};
  const [loadingMessage, setLoadingMessage] = useState('');

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative select-none">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />

      {/* Glass Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(7.3px)',
          WebkitBackdropFilter: 'blur(7.3px)',
          zIndex: 10,
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 z-20 text-white pointer-events-auto">
        {/* Headings */}
        <div className="text-center w-full max-w-3xl mb-8 px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold whitespace-nowrap text-center"
            style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
              fontSize: 'clamp(2.1rem, 5vw, 3rem)', // Responsive scaling
             }}
            
          >
            Bro I Had a Reason
          </h1>
          <p
            className="text-base sm:text-xl md:text-2xl font-bold text-white/90 text-center leading-tight mt-2 sm:mt-4"
            style={{
              display: 'block',
              whiteSpace: 'pre-line',
              overflow: 'visible',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
            }}
          >
            {/* Desktop: One single line */}
            <span className="hidden sm:inline">Some call them lies I call them ✨character development✨.</span>

            {/* Mobile: Two lines, each stays in one line */}
            <span className="sm:hidden">
              Some call them lies{'\n'}
              <span style={{ whiteSpace: 'nowrap' }}>
                I call them ✨character development✨.
              </span>
            </span>
          </p>
        </div>

        {/* Card */}
        <div
          className="w-full max-w-md sm:max-w-lg md:max-w-xl p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl backdrop-filter backdrop-blur-sm border border-white/20"
          style={{
            background: 'radial-gradient(circle at top, rgba(30, 30, 30, 0.5), rgba(15, 15, 15, 0.7))',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), inset 0 0 12px rgba(255,255,255,0.08)',
          }}
        >
          {/* Always show form fields */}
          <div className="space-y-6">
            {/* Tone Selector */}
            <div className="flex flex-col items-start">
              <label className="text-white font-bold text-base sm:text-xl mb-2">Pick your excuse vibe ✨</label>
              <CustomSelect options={tones} value={tone || "Select an option"} onChange={setTone} />
            </div>

            {/* Category Selector */}
            <div className="flex flex-col items-start">
              <label className="text-white font-bold text-base sm:text-xl mb-2">What did you mess up this time? 🚩</label>
              <CustomSelect options={categories} value={category || "Select an option"} onChange={setCategory} />
            </div>

            {/* Custom Situation */}
            <div className="flex flex-col items-start">
              <label className="text-white font-bold text-base sm:text-xl mb-2">Type your tea ☕ (Optional)</label>
              <input
                type="text"
                className="bg-transparent border border-white/30 rounded-lg px-4 py-3 w-full focus:outline-none focus:border-blue-500 text-white placeholder-white/50 text-base appearance-none"
                placeholder={placeholder}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                style={{
                  minHeight: '48px',
                  outline: 'none',
                  boxShadow: 'none',
                  overflow: 'hidden',
                  WebkitAppearance: 'none',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              />
            </div>
          </div>

          {/* Result Box with Copy Button */}
          {step === 'result' && (
            <div
              className="mt-6 bg-yellow-100 text-black p-4 rounded-xl text-left italic shadow-inner whitespace-pre-wrap text-lg sm:text-xl relative"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                borderRadius: '1rem',
                padding: '1rem',
                boxShadow: 'inset 0 0 10px rgba(255,255,255,0.05)',
              }}
            >
              {excuse}

              {/* Copy Button Emoji - Positioned Bottom Right Inside Box */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(excuse);

                  // Show copied notification
                  const copiedEl = document.getElementById('copied-notification');
                  if (copiedEl) {
                    copiedEl.style.opacity = '1';
                    copiedEl.style.transform = 'translateY(0)';
                    setTimeout(() => {
                      copiedEl.style.opacity = '0';
                      copiedEl.style.transform = 'translateY(10px)';
                    }, 1000);
                  }
                }}
                className="absolute bottom-3 right-4 text-white/70 hover:text-white transition-all duration-200"
                title="Copy to clipboard"
              >
                📋
              </button>

              {/* Copied Notification - Positioned Below Copy Button */}
              <div
                id="copied-notification"
                className="absolute bottom-[-24px] right-0 px-3 py-1 bg-black/40 text-white text-sm rounded-md pointer-events-none backdrop-blur-sm transform translate-y-0 opacity-0 transition-all duration-300 whitespace-nowrap"
              >
                Copied!
              </div>
            </div>
          )}

          {/* Buttons */}
          {step === 'form' && (
            <button
              onClick={generateExcuse}
              className="mt-6 w-full font-bold rounded-xl px-6 py-4 bg-blue-600 text-white transition-all duration-300 hover:shadow-lg hover:shadow-black/40 hover:bg-blue-700 text-lg sm:text-xl"
            >
              ✨ Cook My Excuse ✨
            </button>
          )}
          {step === 'loading' && (
            <button
              disabled
              className="mt-6 w-full bg-blue-600 text-white font-semibold rounded-xl px-6 py-4 opacity-90 cursor-wait"
            >
              {loadingMessage}
            </button>
          )}
          {step === 'result' && (
            <button
              onClick={generateExcuse}
              className="mt-6 flex items-center gap-3 bg-blue-600 text-white font-bold rounded-xl px-6 py-4 w-full justify-center hover:bg-blue-700 transition-all duration-300"
            >
              <img
                src="/dj-khaled.png"
                alt="DJ Khaled"
                className="h-6 w-6 md:h-10 md:w-10 object-contain"
              />
              <span className="text-base sm:text-lg">Another One</span>
            </button>
          )}
          {error && <p className="text-red-400 mt-4">{error}</p>}

          {/* Copied Notification */}
          <div
            id="copied-notification"
            className="fixed bottom-4 right-4 px-4 py-2 bg-black/30 text-white text-sm rounded-lg pointer-events-none backdrop-blur-sm transform translate-y-5 opacity-0 transition-all duration-300"
          >
            Copied!
          </div>

        </div>
      </div>
    </div>
  );
}

// Custom Select Component
const CustomSelect = ({ options, value, onChange }: { options: string[], value: string, onChange: (option: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (ref.current && !(ref.current as HTMLElement).contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block w-full" ref={ref}>
      <div
        className="bg-transparent border border-white/30 rounded-lg px-4 py-3 sm:py-4 text-white cursor-pointer text-base sm:text-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value || <span className="text-white opacity-60">Select an option</span>}
      </div>
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-full rounded-xl border border-white/30 shadow-xl z-30 text-white"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow: '0 12px 32px rgba(255,255,255,0.1), inset 0 0 12px rgba(255,255,255,0.08)',
            padding: '0.75rem',
          }}
        >
          {options.map((option) => (
            <div
              key={option}
              className="px-4 py-2 hover:bg-white/10 cursor-pointer transition-colors text-base sm:text-lg"
              onClick={() => handleOptionClick(option)}
            >

              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
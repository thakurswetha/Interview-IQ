import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, RotateCcw, Sparkles, Mic, Headphones, Activity } from 'lucide-react';

export default function AnimatedAvatar({
  state = 'listening', // 'speaking' | 'listening' | 'thinking' | 'idle'
  interviewer = { name: 'Alex Morgan', title: 'Senior Technical Lead', avatarStyle: 'alex' },
  currentQuestionText = '',
  onSpeechComplete,
  autoSpeak = true,
  voiceSettings = { rate: 1.0, pitch: 1.0, voiceIndex: 0 }
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [eyeBlink, setEyeBlink] = useState(false);
  const [captions, setCaptions] = useState('');
  const [isSpeakingInternal, setIsSpeakingInternal] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const speechRef = useRef(null);

  // Load browser voices
  useEffect(() => {
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      }
    };

    updateVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Periodic Eye Blink Animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setEyeBlink(true);
      setTimeout(() => setEyeBlink(false), 180);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  // Dynamic Mouth Animation when speaking
  useEffect(() => {
    let mouthInterval;
    if (state === 'speaking' || isSpeakingInternal) {
      mouthInterval = setInterval(() => {
        setMouthOpen((prev) => !prev);
      }, 140);
    } else {
      setMouthOpen(false);
    }
    return () => clearInterval(mouthInterval);
  }, [state, isSpeakingInternal]);

  // Text to Speech execution
  useEffect(() => {
    if (!currentQuestionText || !autoSpeak || isMuted || !('speechSynthesis' in window)) {
      setCaptions(currentQuestionText || '');
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(currentQuestionText);
    utterance.rate = voiceSettings.rate || 0.98;
    utterance.pitch = voiceSettings.pitch || 1.0;

    // Pick selected voice or natural voice if available
    if (availableVoices.length > 0) {
      let chosenVoice = null;
      if (voiceSettings.voiceName) {
        chosenVoice = availableVoices.find(v => v.name === voiceSettings.voiceName);
      }
      if (!chosenVoice) {
        chosenVoice = availableVoices.find(v =>
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David') || v.name.includes('Guy') || v.name.includes('Jenny')) &&
          v.lang.startsWith('en')
        ) || availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
      }

      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }
    }

    utterance.onstart = () => {
      setIsSpeakingInternal(true);
      setCaptions(currentQuestionText);
    };

    utterance.onend = () => {
      setIsSpeakingInternal(false);
      setMouthOpen(false);
      if (onSpeechComplete) onSpeechComplete();
    };

    utterance.onerror = (e) => {
      console.warn('[Avatar TTS] Speech error:', e);
      setIsSpeakingInternal(false);
      setMouthOpen(false);
      if (onSpeechComplete) onSpeechComplete();
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQuestionText, autoSpeak, isMuted, availableVoices]);

  // Manual repeat question speech
  const handleRepeat = () => {
    if ('speechSynthesis' in window && currentQuestionText) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQuestionText);
      utterance.rate = voiceSettings.rate || 0.98;
      utterance.onstart = () => setIsSpeakingInternal(true);
      utterance.onend = () => {
        setIsSpeakingInternal(false);
        if (onSpeechComplete) onSpeechComplete();
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleMute = () => {
    if ('speechSynthesis' in window && !isMuted) {
      window.speechSynthesis.cancel();
      setIsSpeakingInternal(false);
    }
    setIsMuted(!isMuted);
  };

  const effectiveState = isSpeakingInternal ? 'speaking' : state;
  const personaStyle = (interviewer?.avatarStyle || 'alex').toLowerCase();
  const isSarah = personaStyle.includes('sarah') || personaStyle.includes('executive');
  const isDavid = personaStyle.includes('david') || personaStyle.includes('studio');

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-800 bg-dark-850/90 backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-dark-900/60">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${
              effectiveState === 'speaking' ? 'bg-brand-400 animate-ping' :
              effectiveState === 'listening' ? 'bg-emerald-400 animate-pulse' :
              effectiveState === 'thinking' ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'
            }`} />
            <div className={`absolute inset-0 w-3 h-3 rounded-full ${
              effectiveState === 'speaking' ? 'bg-brand-500' :
              effectiveState === 'listening' ? 'bg-emerald-500' :
              effectiveState === 'thinking' ? 'bg-amber-500' : 'bg-slate-500'
            }`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">{interviewer.name}</h3>
            <p className="text-[11px] text-slate-400 font-medium">{interviewer.title}</p>
          </div>
        </div>

        {/* State Badge */}
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase flex items-center gap-1.5 border ${
            effectiveState === 'speaking' ? 'bg-brand-500/15 text-brand-300 border-brand-500/30' :
            effectiveState === 'listening' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
            effectiveState === 'thinking' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
            'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {effectiveState === 'speaking' && <Volume2 className="w-3.5 h-3.5 animate-bounce" />}
            {effectiveState === 'listening' && <Mic className="w-3.5 h-3.5 animate-pulse text-emerald-400" />}
            {effectiveState === 'thinking' && <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />}
            <span>{effectiveState}</span>
          </span>

          <button
            onClick={toggleMute}
            className={`p-1.5 rounded-lg border transition-colors ${
              isMuted ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' : 'border-slate-700 bg-dark-800 text-slate-300 hover:text-white'
            }`}
            title={isMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Avatar Display Area */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-6 min-h-[300px] overflow-hidden bg-gradient-to-b from-dark-900 via-dark-850 to-dark-900">
        {/* Background glow effects */}
        <div className={`absolute w-72 h-72 rounded-full filter blur-3xl pointer-events-none transition-all duration-700 ${
          effectiveState === 'speaking' ? 'bg-brand-500/20 scale-110' :
          effectiveState === 'listening' ? 'bg-emerald-500/15 scale-100' :
          effectiveState === 'thinking' ? 'bg-amber-500/20 scale-105' : 'bg-slate-700/10'
        }`} />

        {/* Orbit ring when thinking */}
        {effectiveState === 'thinking' && (
          <div className="absolute w-64 h-64 rounded-full border border-dashed border-amber-400/40 animate-spin pointer-events-none" style={{ animationDuration: '6s' }} />
        )}

        {/* Dynamic Voice Waves when speaking */}
        {effectiveState === 'speaking' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-72 h-72 rounded-full border border-brand-400/25 animate-ping" style={{ animationDuration: '2.5s' }} />
            <div className="w-60 h-60 rounded-full border border-brand-500/35 animate-pulse" />
          </div>
        )}

        {/* SVG Animated Human-like AI Avatar */}
        <div className="relative z-10 w-48 h-48 sm:w-56 sm:h-56">
          <svg
            viewBox="0 0 200 200"
            className={`w-full h-full drop-shadow-2xl transition-transform duration-500 ${
              effectiveState === 'speaking' ? 'scale-105' :
              effectiveState === 'listening' ? 'rotate-1' :
              effectiveState === 'thinking' ? '-translate-y-1' : ''
            }`}
          >
            {/* Defs for gradients */}
            <defs>
              <linearGradient id="suitGradAlex" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="suitGradSarah" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#581c87" />
                <stop offset="100%" stopColor="#2e1065" />
              </linearGradient>
              <linearGradient id="suitGradDavid" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fed7aa" />
                <stop offset="100%" stopColor="#fba866" />
              </linearGradient>
              <linearGradient id="haloGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Neural Halo (Glows brighter during thinking) */}
            <circle
              cx="100"
              cy="95"
              r="76"
              fill="none"
              stroke="url(#haloGrad)"
              strokeWidth={effectiveState === 'thinking' ? '3.5' : '1.5'}
              strokeDasharray={effectiveState === 'thinking' ? '4 4' : 'none'}
              className={effectiveState === 'thinking' ? 'animate-spin' : ''}
              style={{ transformOrigin: '100px 95px' }}
            />

            {/* Shoulders / Attire */}
            <path
              d="M 35 190 Q 60 148 100 148 Q 140 148 165 190 L 165 200 L 35 200 Z"
              fill={isSarah ? 'url(#suitGradSarah)' : isDavid ? 'url(#suitGradDavid)' : 'url(#suitGradAlex)'}
              stroke="#334155"
              strokeWidth="1.5"
            />

            {/* Shirt / Blouse Details */}
            {isSarah ? (
              <>
                <polygon points="100,148 88,172 100,185 112,172" fill="#f8fafc" />
                <circle cx="100" cy="180" r="2.5" fill="#e2e8f0" />
              </>
            ) : isDavid ? (
              <rect x="86" y="146" width="28" height="12" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            ) : (
              <>
                <polygon points="100,148 85,175 100,195 115,175" fill="#f8fafc" />
                <polygon points="97,165 103,165 102,198 98,198" fill="#6366f1" />
              </>
            )}

            {/* Neck */}
            <rect x="88" y="125" width="24" height="26" rx="4" fill="url(#skinGrad)" />

            {/* Head / Face */}
            <ellipse cx="100" cy="95" rx="42" ry="48" fill="url(#skinGrad)" />

            {/* Hair Style */}
            {isSarah ? (
              <>
                {/* Back long hair flow */}
                <path d="M 52 80 C 45 120 40 165 52 185 C 60 160 58 120 62 90 Z" fill="#1e1b4b" />
                <path d="M 148 80 C 155 120 160 165 148 185 C 140 160 142 120 138 90 Z" fill="#1e1b4b" />
                {/* Front hair */}
                <path d="M 58 85 C 56 45 80 36 100 36 C 122 36 144 45 142 85 C 128 62 118 64 100 64 C 82 64 72 62 58 85 Z" fill="#1e1b4b" />
              </>
            ) : isDavid ? (
              <path d="M 58 85 C 57 48 76 42 100 42 C 124 42 143 48 142 85 C 132 68 116 70 100 70 C 84 70 68 68 58 85 Z" fill="#334155" />
            ) : (
              <path d="M 58 85 C 56 50 78 40 100 40 C 122 40 144 50 142 85 C 130 65 118 68 100 68 C 82 68 70 65 58 85 Z" fill="#1e293b" />
            )}

            {/* Eyebrows */}
            <path
              d={effectiveState === 'thinking' ? "M 75 74 Q 85 70 93 75" : "M 75 75 Q 85 73 93 76"}
              stroke="#334155"
              strokeWidth={isSarah ? "2" : "2.5"}
              fill="none"
              strokeLinecap="round"
            />
            <path
              d={effectiveState === 'thinking' ? "M 107 75 Q 115 70 125 74" : "M 107 76 Q 115 73 125 75"}
              stroke="#334155"
              strokeWidth={isSarah ? "2" : "2.5"}
              fill="none"
              strokeLinecap="round"
            />

            {/* Eyes */}
            {eyeBlink ? (
              <>
                <line x1="77" y1="88" x2="91" y2="88" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="109" y1="88" x2="123" y2="88" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                <ellipse cx="84" cy="88" rx="6.5" ry="5.5" fill="#ffffff" />
                <circle
                  cx={effectiveState === 'thinking' ? 85 : 84}
                  cy={effectiveState === 'thinking' ? 86 : 88}
                  r="3.2"
                  fill="#1e293b"
                />
                <circle cx="85" cy="86.5" r="1" fill="#ffffff" />

                <ellipse cx="116" cy="88" rx="6.5" ry="5.5" fill="#ffffff" />
                <circle
                  cx={effectiveState === 'thinking' ? 117 : 116}
                  cy={effectiveState === 'thinking' ? 86 : 88}
                  r="3.2"
                  fill="#1e293b"
                />
                <circle cx="117" cy="86.5" r="1" fill="#ffffff" />
              </>
            )}

            {/* Glasses / Headset Accents */}
            {isSarah ? (
              <>
                <ellipse cx="84" cy="87" rx="10" ry="8" fill="none" stroke="#7e22ce" strokeWidth="1.6" />
                <ellipse cx="116" cy="87" rx="10" ry="8" fill="none" stroke="#7e22ce" strokeWidth="1.6" />
                <line x1="94" y1="87" x2="106" y2="87" stroke="#7e22ce" strokeWidth="1.6" />
                {/* Earrings */}
                <circle cx="56" cy="105" r="2.5" fill="#facc15" />
                <circle cx="144" cy="105" r="2.5" fill="#facc15" />
              </>
            ) : isDavid ? (
              <>
                {/* Subtle Modern Studio Headset Mic on right ear */}
                <ellipse cx="143" cy="98" rx="4" ry="7" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5" />
                <path d="M 143 103 Q 130 115 118 116" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="117" cy="116" r="2.5" fill="#06b6d4" />
              </>
            ) : (
              <>
                {/* Smart Rectangle Tech Glasses */}
                <rect x="74" y="80" width="20" height="15" rx="3" fill="none" stroke="#475569" strokeWidth="1.8" />
                <rect x="106" y="80" width="20" height="15" rx="3" fill="none" stroke="#475569" strokeWidth="1.8" />
                <line x1="94" y1="86" x2="106" y2="86" stroke="#475569" strokeWidth="1.8" />
              </>
            )}

            {/* Nose */}
            <path d="M 100 88 L 98 106 L 102 106" stroke="#ea580c" strokeWidth="1.2" fill="none" strokeLinecap="round" />

            {/* Animated Mouth */}
            {effectiveState === 'speaking' ? (
              mouthOpen ? (
                // Open mouth speaking phoneme
                <ellipse cx="100" cy="120" rx="9" ry="6" fill="#881337" stroke="#9f1239" strokeWidth="1" />
              ) : (
                // Semi-closed mouth
                <ellipse cx="100" cy="119" rx="8" ry="2.5" fill="#9f1239" />
              )
            ) : effectiveState === 'listening' ? (
              // Attentive slight smile
              <path d="M 92 118 Q 100 123 108 118" stroke="#9f1239" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            ) : (
              // Neutral / Thoughtful mouth
              <line x1="94" y1="120" x2="106" y2="120" stroke="#9f1239" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </div>

        {/* Live Audio Equalizer Bars when speaking */}
        {effectiveState === 'speaking' && (
          <div className="flex items-center gap-1 mt-4">
            <span className="w-1 h-3 bg-brand-400 rounded-full animate-sound-wave" style={{ animationDelay: '0.1s' }} />
            <span className="w-1 h-6 bg-brand-400 rounded-full animate-sound-wave" style={{ animationDelay: '0.3s' }} />
            <span className="w-1 h-8 bg-brand-400 rounded-full animate-sound-wave" style={{ animationDelay: '0.5s' }} />
            <span className="w-1 h-5 bg-brand-400 rounded-full animate-sound-wave" style={{ animationDelay: '0.2s' }} />
            <span className="w-1 h-3 bg-brand-400 rounded-full animate-sound-wave" style={{ animationDelay: '0.4s' }} />
          </div>
        )}
      </div>

      {/* Synchronized Question Display & Captions */}
      <div className="p-4 border-t border-slate-800 bg-dark-900/90">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" />
            <span>Interviewer Prompt</span>
          </div>

          <button
            onClick={handleRepeat}
            disabled={effectiveState === 'speaking'}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-dark-800 hover:bg-dark-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
            title="Repeat interviewer question"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Repeat Question</span>
          </button>
        </div>

        <p className="text-sm font-medium text-slate-100 leading-relaxed min-h-[50px]">
          {captions || 'Waiting for interview question to begin...'}
        </p>
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Settings,
  Volume2,
  Mic,
  Video,
  Key,
  Shield,
  Save,
  CheckCircle2,
  HelpCircle,
  Cpu
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { success } = useToast();

  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('interviewiq_voice_settings') || '{}');
      return saved.voiceName || '';
    } catch (_) { return ''; }
  });
  const [speechRate, setSpeechRate] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('interviewiq_voice_settings') || '{}');
      return saved.speechRate || 1.0;
    } catch (_) { return 1.0; }
  });
  const [autoListen, setAutoListen] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('interviewiq_voice_settings') || '{}');
      return saved.autoListen !== undefined ? saved.autoListen : true;
    } catch (_) { return true; }
  });

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const load = () => {
        const v = window.speechSynthesis.getVoices();
        setVoices(v);
        if (v.length > 0 && !selectedVoice) {
          const natural = v.find(item => item.name.includes('Natural') || item.name.includes('Google') || item.name.includes('Samantha') || item.name.includes('David'));
          setSelectedVoice(natural ? natural.name : v[0].name);
        }
      };
      load();
      window.speechSynthesis.onvoiceschanged = load;
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    const settings = {
      voiceName: selectedVoice,
      speechRate,
      autoListen
    };
    localStorage.setItem('interviewiq_voice_settings', JSON.stringify(settings));
    success('Audio, voice and interviewer settings saved successfully!');
  };

  const testVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance('Hello! This is a test of your InterviewIQ AI interviewer voice.');
      utt.rate = speechRate;
      const vObj = voices.find(v => v.name === selectedVoice);
      if (vObj) utt.voice = vObj;
      window.speechSynthesis.speak(utt);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-brand-400" />
          <span>Platform & Audio/Video Settings</span>
        </h1>
        <p className="text-sm text-slate-400">
          Configure avatar voice synthesis, microphone preferences, and AI service provider connectivity.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Voice & Speech Synthesis */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-brand-400">
            <Volume2 className="w-4 h-4" />
            <span>AI Interviewer Voice & Synthesis</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Synthesized Voice Model
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
              >
                {voices.map((v, i) => (
                  <option key={i} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Speaking Rate: {speechRate}x</span>
                <span className="text-slate-500">Normal: 1.0x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.05"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-brand-500 h-2 bg-dark-900 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={testVoice}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-dark-800 hover:bg-dark-750 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-brand-400" />
                <span>Test Voice Sample</span>
              </button>
            </div>
          </div>
        </div>

        {/* Media & Input Preferences */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-brand-400">
            <Mic className="w-4 h-4" />
            <span>Microphone & Speech Recognition</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-dark-850 border border-slate-800 hover:bg-dark-800 transition-colors">
              <input
                type="checkbox"
                checked={autoListen}
                onChange={(e) => setAutoListen(e.target.checked)}
                className="w-4 h-4 accent-brand-500 rounded"
              />
              <div>
                <span className="text-xs font-bold text-white block">Automatic Microphone Activation</span>
                <span className="text-[11px] text-slate-400">Automatically activate speech listening after the AI finishes speaking the question.</span>
              </div>
            </label>
          </div>
        </div>

        {/* AI Backend Provider Status */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-brand-400">
            <Cpu className="w-4 h-4" />
            <span>AI Provider Architecture</span>
          </h3>

          <div className="p-4 rounded-2xl bg-dark-850 border border-slate-800 text-xs space-y-2 text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Backend AI Service:</span>
              <span className="font-mono text-emerald-400 font-semibold">Modular Gemini / Intelligent Rule Engine</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Security Architecture:</span>
              <span className="text-white font-medium">All API keys strictly isolated on backend (never frontend)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Deterministic Fallback:</span>
              <span className="text-slate-200 font-medium">Enabled (Guarantees 100% offline uptime & zero latency spikes)</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}


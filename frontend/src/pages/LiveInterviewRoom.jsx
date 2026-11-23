import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewService } from '../services/api';
import { useToast } from '../context/ToastContext';
import AnimatedAvatar from '../components/avatar/AnimatedAvatar';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Square,
  Send,
  RotateCcw,
  Clock,
  Sparkles,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Loader2,
  Edit3,
  Bot
} from 'lucide-react';

export default function LiveInterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: toastError, info } = useToast();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarState, setAvatarState] = useState('speaking'); // 'speaking' | 'listening' | 'thinking'

  // Voice Settings from localStorage
  const [voiceSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('interviewiq_voice_settings') || '{}');
      return {
        rate: saved.speechRate || 0.98,
        voiceName: saved.voiceName || '',
        autoListen: saved.autoListen !== undefined ? saved.autoListen : true
      };
    } catch (_) {
      return { rate: 0.98, voiceName: '', autoListen: true };
    }
  });

  // Webcam & Media States
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [mediaError, setMediaError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Speech Recognition & Answer States
  const [answerText, setAnswerText] = useState('');
  const [isRecordingAnswer, setIsRecordingAnswer] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const recognitionRef = useRef(null);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Fetch Interview Session
  useEffect(() => {
    fetchSession();
  }, [id]);

  const fetchSession = async () => {
    try {
      const res = await interviewService.getById(id);
      if (res.data.success) {
        setSession(res.data.session);
        setQuestionStartTime(Date.now());
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to load interview session.');
    } finally {
      setLoading(false);
    }
  };

  // Live Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Webcam Preview
  useEffect(() => {
    const initCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.warn('[Webcam] Could not access camera/mic:', err.message);
        setMediaError('Camera or microphone access denied or not available. Text fallback is active.');
      }
    };

    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setAnswerText(prev => {
        const base = prev.endsWith(' ') || prev === '' ? prev : prev + ' ';
        return base + currentTranscript;
      });
    };

    recognition.onerror = (e) => {
      console.warn('[SpeechRec] Recognition error:', e.error);
      setIsRecordingAnswer(false);
    };

    recognition.onend = () => {
      setIsRecordingAnswer(false);
    };

    recognitionRef.current = recognition;
  }, []);

  // Toggle Speech Recognition Recording
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toastError('Browser speech recognition unavailable. You can type your answer below.');
      return;
    }

    if (isRecordingAnswer) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsRecordingAnswer(false);
      setAvatarState('thinking');
    } else {
      try {
        recognitionRef.current.start();
        setIsRecordingAnswer(true);
        setAvatarState('listening');
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraActive(videoTrack.enabled);
      }
    }
  };

  // Toggle Microphone
  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicActive(audioTrack.enabled);
      }
    }
  };

  // Avatar finishes reading the question aloud
  const handleAvatarSpeechComplete = () => {
    setAvatarState('listening');
    // Auto-start listening if enabled in settings and speech is supported
    if (voiceSettings.autoListen && speechSupported && recognitionRef.current && !isRecordingAnswer) {
      try {
        recognitionRef.current.start();
        setIsRecordingAnswer(true);
      } catch (_) {}
    }
  };

  // Current Question
  const currentQIndex = session?.currentQuestionIndex || 0;
  const currentQuestion = session?.questions?.[currentQIndex] || {
    questionId: 'q_default',
    questionText: 'Tell me about yourself and your background in software engineering.',
    category: 'Technical'
  };

  // Submit Answer
  const handleSubmitAnswer = async () => {
    if (isRecordingAnswer && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsRecordingAnswer(false);
    }

    const duration = Math.max(Math.round((Date.now() - questionStartTime) / 1000), 5);
    setEvaluating(true);
    setAvatarState('thinking');

    try {
      const res = await interviewService.submitAnswer(id, {
        questionId: currentQuestion.questionId,
        answerText: answerText.trim() || 'No explicit answer recorded.',
        durationSeconds: duration
      });

      if (res.data.success) {
        const { isFinished, followUpAdded, followUpQuestion, reportId, session: updatedSession } = res.data;

        setAnswerText('');
        setQuestionStartTime(Date.now());
        setSession(updatedSession);

        if (isFinished) {
          success('Interview completed! Generating your evaluation report...');
          navigate(`/interview/completed/${id}`, { state: { reportId } });
        } else {
          if (followUpAdded) {
            info(`Adaptive Follow-up: "${followUpQuestion?.questionText}"`);
          } else {
            success('Answer evaluated. Moving to next question.');
          }
          setAvatarState('speaking');
        }
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Error evaluating answer.');
      setAvatarState('listening');
    } finally {
      setEvaluating(false);
    }
  };

  // End Interview Early
  const handleEndInterview = async () => {
    if (window.confirm('Are you sure you want to conclude this interview session now? Completed answers will be evaluated.')) {
      try {
        if (isRecordingAnswer && recognitionRef.current) {
          recognitionRef.current.stop();
        }
        const res = await interviewService.complete(id);
        if (res.data.success) {
          navigate(`/interview/completed/${id}`, { state: { reportId: res.data.reportId } });
        }
      } catch (err) {
        toastError('Failed to complete interview.');
      }
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-4 text-slate-300">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-sm font-medium">Entering secure AI Interview room...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-dark-950 flex flex-col">
      {/* Top Session Status Bar */}
      <div className="px-6 py-3 border-b border-slate-800 bg-dark-900/90 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{session?.targetRole || 'Software Engineer'} Mock Interview</span>
              <span className="px-2 py-0.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-[10px] font-mono">
                {session?.interviewType} • {session?.difficulty}
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-5 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-mono text-slate-200 bg-dark-800 px-3 py-1 rounded-xl border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <span>Question {currentQIndex + 1} of {session?.questions?.length || 5}</span>
            {currentQuestion.isFollowUp && (
              <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px]">
                Adaptive Follow-Up
              </span>
            )}
          </div>

          <button
            onClick={handleEndInterview}
            className="px-3 py-1 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs transition-colors"
          >
            End Interview
          </button>
        </div>
      </div>

      {/* Main Dual Viewport: Avatar (Left) vs Candidate Webcam (Right) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Human-Like Animated AI Interviewer */}
        <div className="h-full min-h-[420px]">
          <AnimatedAvatar
            state={avatarState}
            interviewer={session?.interviewerPersona || { name: 'Alex Morgan', title: 'Senior Technical Lead', avatarStyle: 'alex' }}
            currentQuestionText={currentQuestion.questionText}
            onSpeechComplete={handleAvatarSpeechComplete}
            autoSpeak={true}
            voiceSettings={voiceSettings}
          />
        </div>

        {/* RIGHT: Candidate Live Video Preview & Transcript Input */}
        <div className="flex flex-col h-full rounded-2xl border border-slate-800 bg-dark-850/90 backdrop-blur-xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-dark-900/60">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${cameraActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              <h3 className="text-sm font-bold text-white">Candidate Camera Preview</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleCamera}
                className={`p-1.5 rounded-lg border transition-colors ${
                  cameraActive ? 'border-slate-700 bg-dark-800 text-slate-300' : 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                }`}
                title={cameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {cameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                onClick={toggleMic}
                className={`p-1.5 rounded-lg border transition-colors ${
                  micActive ? 'border-slate-700 bg-dark-800 text-slate-300' : 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                }`}
                title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Video Feed Area */}
          <div className="relative flex-1 bg-black flex items-center justify-center min-h-[220px] overflow-hidden">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="text-center p-6 text-slate-500">
                <VideoOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Camera preview is paused.</p>
              </div>
            )}

            {/* Live recording indicator on video */}
            {isRecordingAnswer && (
              <>
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-bold shadow-lg animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>Recording Speech...</span>
                </div>

                {/* Audio visualizer bar overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-1.5 p-2 bg-dark-900/80 backdrop-blur-md rounded-xl border border-rose-500/30">
                  <span className="w-1.5 h-3 bg-rose-400 rounded-full animate-sound-wave" style={{ animationDelay: '0.1s' }} />
                  <span className="w-1.5 h-6 bg-rose-400 rounded-full animate-sound-wave" style={{ animationDelay: '0.3s' }} />
                  <span className="w-1.5 h-8 bg-rose-400 rounded-full animate-sound-wave" style={{ animationDelay: '0.5s' }} />
                  <span className="w-1.5 h-10 bg-rose-400 rounded-full animate-sound-wave" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1.5 h-7 bg-rose-400 rounded-full animate-sound-wave" style={{ animationDelay: '0.4s' }} />
                  <span className="w-1.5 h-4 bg-rose-400 rounded-full animate-sound-wave" style={{ animationDelay: '0.15s' }} />
                  <span className="text-[11px] font-mono text-rose-300 ml-2 font-bold">Listening & Transcribing Voice...</span>
                </div>
              </>
            )}

            {mediaError && (
              <div className="absolute bottom-3 left-3 right-3 p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-[11px] text-center">
                {mediaError}
              </div>
            )}
          </div>

          {/* Real-time Answer Transcript / Text Editor Fallback */}
          <div className="p-4 border-t border-slate-800 bg-dark-900/95 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-brand-400" />
                <span>Candidate Response (Voice or Manual Text)</span>
              </span>

              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold transition-all ${
                    isRecordingAnswer
                      ? 'border-rose-500 bg-rose-500/20 text-rose-300 animate-pulse'
                      : 'border-slate-700 bg-dark-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isRecordingAnswer ? 'Stop Mic Recording' : 'Record with Microphone'}</span>
                </button>
              )}
            </div>

            <textarea
              rows={3}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Speak naturally into your microphone or type your answer here..."
              className="w-full bg-dark-850 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                Word Count: <span className="font-mono text-slate-300">{answerText.trim().split(/\s+/).filter(Boolean).length}</span> words
              </span>

              <button
                onClick={handleSubmitAnswer}
                disabled={evaluating || (!answerText.trim() && !isRecordingAnswer)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-accent text-white font-bold text-xs shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 disabled:opacity-50 transition-all"
              >
                {evaluating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating with AI Rubric...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Next Question</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


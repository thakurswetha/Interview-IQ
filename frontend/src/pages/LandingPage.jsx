import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Video,
  Mic,
  BrainCircuit,
  FileCheck2,
  BarChart3,
  CheckCircle2,
  Star,
  Users,
  Target,
  Cpu,
  Layers,
  TrendingUp,
  Activity,
  Award,
  Zap,
  LogIn
} from 'lucide-react';

export default function LandingPage() {
  const keyFeatures = [
    {
      icon: <Video className="w-6 h-6 text-brand-400" />,
      title: 'Human-Like Animated AI Interviewer',
      description: 'Interact with animated AI avatars featuring synchronized lip movement, dynamic speaking, listening, and thinking states via Web Speech API.'
    },
    {
      icon: <Target className="w-6 h-6 text-emerald-400" />,
      title: 'Role-Specific Question Intelligence',
      description: 'Specialized question generation tailored across 30+ engineering, data, AI, cloud, security, and product roles—or define any custom target role.'
    },
    {
      icon: <FileCheck2 className="w-6 h-6 text-sky-400" />,
      title: 'Resume & Job Match Analysis',
      description: 'Extract technical skills, frameworks, and projects from PDF/DOCX resumes and measure direct alignment against job descriptions with gap analysis.'
    },
    {
      icon: <BrainCircuit className="w-6 h-6 text-purple-400" />,
      title: 'Adaptive Follow-Up Questions',
      description: 'The AI interviewer actively listens to your answers in real time and probes deeper with contextual follow-up questions just like a senior hiring manager.'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-amber-400" />,
      title: 'STAR & Objective Rubric Scoring',
      description: 'Receive quantitative feedback on technical correctness, STAR framework structuring, speaking pace (WPM), filler word counts, and sample ideal answers.'
    },
    {
      icon: <Bot className="w-6 h-6 text-rose-400" />,
      title: '24/7 AI Career Preparation Coach',
      description: 'Interactive career assistant to rewrite resume bullet points, clarify difficult system design trade-offs, and conduct rapid technical drilling.'
    }
  ];

  const howItWorksSteps = [
    {
      step: '01',
      title: 'Select Role & Upload Resume',
      desc: 'Pick from 6 domain categories or input a custom title. Upload your resume or paste a target job description for instant skill alignment.'
    },
    {
      step: '02',
      title: 'Configure Your Session',
      desc: 'Customize interview focus (Technical, Behavioral, HR, Project-Based, or Mixed), choose difficulty level, and set question targets.'
    },
    {
      step: '03',
      title: 'Interactive Live Simulation',
      desc: 'Engage in a voice-enabled interview with the animated avatar. Use speech-to-text or typed responses with live camera preview.'
    },
    {
      step: '04',
      title: 'Instant Actionable Analytics',
      desc: 'Review granular category scorecards, delivery metrics, identified skill gaps, model answers, and printable PDF evaluation reports.'
    }
  ];

  const whyChooseUs = [
    {
      title: 'Eliminate Interview Anxiety',
      description: 'Simulate high-stakes technical and behavioral interviews in a safe, realistic sandbox until articulate communication becomes second nature.',
      stat: '94%',
      statLabel: 'Report higher confidence'
    },
    {
      title: 'Objective, Unbiased Evaluation',
      description: 'Every answer is measured against a transparent rubric: technical depth, problem-solving structure, clarity, and behavioral impact.',
      stat: '5-Factor',
      statLabel: 'Scoring breakdown'
    },
    {
      title: 'Dynamic Real-Time Adaptation',
      description: 'No static question decks. The AI listens to what you said—or omitted—and asks relevant follow-up questions on your exact projects.',
      stat: '100%',
      statLabel: 'Personalized prompts'
    },
    {
      title: 'Targeted Skill Gap Discovery',
      description: 'Identify exact missing technical proficiencies and receive structured preparation resources before walking into real recruiter calls.',
      stat: '30+',
      statLabel: 'Supported job roles'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 bg-gradient-to-b from-dark-900 via-dark-850 to-dark-900 border-b border-slate-800/80">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[380px] bg-brand-500/15 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Subtitle Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs sm:text-sm font-semibold mb-6 animate-fade-in shadow-sm">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>AI-Powered Mock Interview Platform</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            Interview<span className="bg-gradient-to-r from-brand-400 via-brand-300 to-purple-400 bg-clip-text text-transparent">IQ</span>
          </h1>

          {/* Tagline */}
          <p className="mt-4 text-xl sm:text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
            Practice smarter. Interview confidently. Get hired.
          </p>

          {/* Supporting Description */}
          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Experience personalized AI-powered mock interviews, receive instant feedback, identify skill gaps, and improve your interview performance.
          </p>

          {/* Primary Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent text-white font-bold text-base shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:opacity-95 transition-all group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl border border-slate-700 bg-dark-800/90 hover:bg-dark-700 text-slate-100 font-semibold text-base transition-colors shadow-sm"
            >
              <LogIn className="w-4 h-4 text-slate-400" />
              <span>Login</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>30+ Domain Job Roles</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Voice & Web Speech AI</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Objective STAR Framework Rubrics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Private Isolated Candidate Storage</span>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Key Features Section */}
      <section id="features" className="py-24 bg-dark-900 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-2">Core Capabilities</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Key Features
            </p>
            <p className="mt-4 text-sm sm:text-base text-slate-400">
              State-of-the-art tools designed to elevate your interview readiness from resume analysis to dynamic live conversations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-dark-800 border border-slate-700 flex items-center justify-center mb-5">
                    {feat.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. How It Works Section */}
      <section id="how-it-works" className="py-24 bg-dark-950/70 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-2">Seamless Workflow</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How It Works
            </p>
            <p className="mt-4 text-sm sm:text-base text-slate-400">
              Go from resume upload to comprehensive mock interview evaluation in four intuitive steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {howItWorksSteps.map((st, i) => (
              <div key={i} className="relative p-6 rounded-2xl bg-dark-900 border border-slate-800/90 flex flex-col">
                <span className="text-4xl font-extrabold text-brand-500/30 mb-4 font-mono">{st.step}</span>
                <h3 className="text-base font-bold text-white mb-2">{st.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Why InterviewIQ Section */}
      <section id="why-interviewiq" className="py-24 bg-dark-900 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-2">Competitive Edge</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Why InterviewIQ
            </p>
            <p className="mt-4 text-sm sm:text-base text-slate-400">
              Traditional interview prep is passive. InterviewIQ delivers an interactive, high-fidelity simulation that trains real communicative reflexes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {whyChooseUs.map((item, idx) => (
              <div key={idx} className="glass-panel p-8 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <div className="text-right">
                      <div className="text-2xl font-black text-brand-400 font-mono">{item.stat}</div>
                      <div className="text-[11px] text-slate-500">{item.statLabel}</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. AI-Powered Interview Experience Section */}
      <section id="ai-experience" className="py-24 bg-dark-950/70 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-4">
                <Video className="w-3.5 h-3.5" />
                <span>Immersive Simulation</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-6">
                AI-Powered Interview Experience
              </h2>
              <p className="text-base text-slate-300 leading-relaxed mb-6">
                Interact with lifelike animated avatars that react in real time. Watch their facial cues transition between listening, processing, and vocalizing questions, perfectly synchronized with your speech.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/15 border border-brand-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Mic className="w-4 h-4 text-brand-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Voice & Speech Synthesis</h4>
                    <p className="text-xs text-slate-400">Speak naturally through your microphone with live speech-to-text transcription and browser voice narration.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Video className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Live Candidate Webcam Preview</h4>
                    <p className="text-xs text-slate-400">Maintain realistic eye contact, inspect posture, and rehearse your professional presentation demeanor.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <BrainCircuit className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Dynamic Adaptive Follow-Ups</h4>
                    <p className="text-xs text-slate-400">When your response needs deeper elaboration, the interviewer poses immediate intelligent follow-up inquiries.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Simulation Preview Card */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-mono font-medium text-slate-300">LIVE MOCK SESSION • DATA ANALYST</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">Avatar Speaking</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* AI Avatar Preview */}
                <div className="aspect-video bg-dark-900 rounded-xl border border-slate-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/30 mb-2">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-xs font-bold text-white">Alex Morgan</span>
                  <span className="text-[10px] text-brand-400">Principal Interviewer</span>
                  <div className="flex gap-1 mt-2">
                    <span className="w-1.5 h-3 bg-brand-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-5 bg-brand-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-3 bg-brand-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>

                {/* Candidate Webcam Preview */}
                <div className="aspect-video bg-dark-900 rounded-xl border border-slate-800 flex flex-col items-center justify-center p-4 text-center">
                  <Video className="w-8 h-8 text-slate-600 mb-2" />
                  <span className="text-xs font-medium text-slate-300">Candidate Preview</span>
                  <span className="text-[10px] text-slate-500">Mic Active • 135 WPM</span>
                </div>
              </div>

              <div className="bg-dark-900/90 rounded-xl p-3 border border-slate-800 text-xs">
                <p className="text-slate-400 font-mono text-[11px] mb-1">CURRENT QUESTION:</p>
                <p className="text-slate-200 font-medium">
                  "Can you walk me through how you write SQL queries using CTEs and window functions like ROW_NUMBER() to resolve reporting discrepancies?"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Performance Analytics Section */}
      <section id="analytics" className="py-24 bg-dark-900 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-2">Quantifiable Feedback</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Performance Analytics
            </p>
            <p className="mt-4 text-sm sm:text-base text-slate-400">
              Measure your progress across sessions with granular radar charts, delivery indicators, and rubric score breakdowns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metric 1 */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center mb-4">
                <Award className="w-5 h-5 text-brand-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">STAR Structure Grading</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Evaluates your behavioral answers for explicit Situation, Task, Action, and Result framing to maximize executive impact.
              </p>
              <div className="flex items-center justify-between text-xs font-mono border-t border-slate-800 pt-3">
                <span className="text-slate-500">Benchmark:</span>
                <span className="text-emerald-400 font-bold">85%+ Target</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Speech Pace & Filler Words</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Tracks words-per-minute (WPM) cadence and flags excessive filler utterances ('um', 'like', 'you know') in real-time.
              </p>
              <div className="flex items-center justify-between text-xs font-mono border-t border-slate-800 pt-3">
                <span className="text-slate-500">Optimal Pace:</span>
                <span className="text-emerald-400 font-bold">120 - 150 WPM</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Historical Progress Tracking</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Monitor cumulative growth trends across multiple interview sessions to verify that your weaknesses are systematically resolved.
              </p>
              <div className="flex items-center justify-between text-xs font-mono border-t border-slate-800 pt-3">
                <span className="text-slate-500">Analytics:</span>
                <span className="text-purple-400 font-bold">Multi-Session History</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-b from-dark-900 to-dark-950 border-b border-slate-800/80 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-base text-slate-300 max-w-xl mx-auto mb-8">
            Start practicing with InterviewIQ today. Set up your target role, configure your mock session, and get actionable AI evaluation within minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent text-white font-bold text-base shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:opacity-95 transition-all group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl border border-slate-700 bg-dark-800/90 hover:bg-dark-700 text-slate-100 font-semibold text-base transition-colors"
            >
              <LogIn className="w-4 h-4 text-slate-400" />
              <span>Login to Account</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

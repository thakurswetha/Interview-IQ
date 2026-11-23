import React, { useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Award, ArrowRight, CheckCircle2, BarChart3, Home, Sparkles } from 'lucide-react';

export default function InterviewCompletionPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const reportId = location.state?.reportId;

  useEffect(() => {
    // Launch celebratory confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (_) {}
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-dark-900 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full relative z-10 text-center space-y-6">
        <div className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 via-brand-500 to-emerald-500 p-0.5 shadow-2xl shadow-brand-500/30">
          <div className="w-full h-full bg-dark-900 rounded-[22px] flex items-center justify-center">
            <Award className="w-10 h-10 text-brand-400 animate-bounce" />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
            <CheckCircle2 className="w-4 h-4" />
            <span>Interview Successfully Completed</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Fantastic Effort!
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Your responses have been processed through our objective evaluation rubric. We've scored your technical accuracy, communication indicators (WPM & fillers), and behavioral STAR structure.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <Link
            to={`/report/${id}`}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent text-white font-bold text-sm shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-[1.02] transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Detailed Performance Report</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-slate-700 bg-dark-800 hover:bg-dark-750 text-slate-300 text-sm font-semibold transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


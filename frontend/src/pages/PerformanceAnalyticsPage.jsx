import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Award,
  AlertTriangle,
  Play,
  BrainCircuit,
  MessageSquare,
  Activity,
  Sparkles,
  ArrowRight,
  Loader2
} from 'lucide-react';

export default function PerformanceAnalyticsPage() {
  const { error: toastError } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await reportService.getAnalytics();
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      toastError('Could not load analytics metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-4 text-slate-300">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-sm font-medium">Aggregating historical metrics & trendlines...</p>
      </div>
    );
  }

  const trends = data?.trends || [];
  const summary = data?.summary || { totalInterviews: 0, averageScore: 0, highestScore: 0, totalQuestionsAnswered: 0 };
  const weaknesses = data?.recurringWeaknesses || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-brand-400" />
            <span>Candidate Growth Analytics</span>
          </h1>
          <p className="text-sm text-slate-400">
            Multi-session performance tracking across technical knowledge, STAR framework structure, and communication indicators.
          </p>
        </div>

        <Link
          to="/interview/config"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-accent text-white font-bold text-xs shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all self-start sm:self-auto"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Launch Practice Session</span>
        </Link>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Sessions</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">{summary.totalInterviews}</span>
            <span className="text-xs text-slate-400">interviews</span>
          </div>
          <p className="mt-2 text-xs text-brand-400">Total sessions recorded</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Score</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-brand-300">{summary.averageScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Standardized Rubric Avg</span>
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Highest Score Achieved</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">{summary.highestScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Personal milestone</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Questions Answered</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-purple-400">{summary.totalQuestionsAnswered}</span>
            <span className="text-xs text-slate-400">prompts</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Technical & behavioral</p>
        </div>
      </div>

      {trends.length > 0 ? (
        <>
          {/* Chart 1: Score Progression Line Chart */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Overall Score Progression Over Time</h3>
                <p className="text-xs text-slate-400">Tracks performance across consecutive interview attempts</p>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: '#6366f1' }} activeDot={{ r: 8 }} name="Overall Score" />
                  <Line type="monotone" dataKey="technical" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" name="Technical Knowledge" />
                  <Line type="monotone" dataKey="communication" stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 5" name="Communication Clarity" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Speaking Pace (WPM) & Filler Words */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <span>Speaking Pace (Words Per Minute)</span>
                </h3>
                <p className="text-xs text-slate-400">Target range: 110-150 WPM</p>
              </div>

              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="sessionNumber" tickFormatter={(v) => `Session ${v}`} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis domain={[0, 180]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                    <Bar dataKey="speakingPaceWpm" fill="#10b981" radius={[6, 6, 0, 0]} name="Speaking Pace (WPM)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  <span>Filler Words Frequency</span>
                </h3>
                <p className="text-xs text-slate-400">Lower is better ("um", "like", "basically")</p>
              </div>

              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="sessionNumber" tickFormatter={(v) => `Session ${v}`} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="fillerWords" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} name="Total Filler Words" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recurring Weaknesses & One-Click Targeted Drill */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span>Frequently Detected Areas for Improvement</span>
                </h3>
                <p className="text-xs text-slate-400">Weaknesses recurring across your recorded sessions</p>
              </div>

              <Link
                to="/interview/config"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Drill Weak Areas</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {weaknesses.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-dark-850 border border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-200">{item.text}</span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-mono shrink-0 font-bold">
                    {item.occurrences}x flagged
                  </span>
                </div>
              ))}
              {weaknesses.length === 0 && (
                <p className="text-xs text-slate-500 italic">No recurring weaknesses detected. Outstanding performance!</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4">
          <BrainCircuit className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Historical Analytics Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Complete your first interview to generate real-time metrics, communication pace graphs, and rubric score trendlines.
          </p>
          <Link
            to="/interview/config"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start First Mock Interview</span>
          </Link>
        </div>
      )}
    </div>
  );
}


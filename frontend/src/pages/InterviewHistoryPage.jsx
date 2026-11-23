import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService, interviewService } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  History,
  Calendar,
  Award,
  Play,
  ArrowRight,
  Filter,
  BrainCircuit,
  Loader2,
  Clock,
  Sparkles
} from 'lucide-react';

export default function InterviewHistoryPage() {
  const { error: toastError } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await reportService.getHistory();
      if (res.data.success) {
        setReports(res.data.reports || []);
      }
    } catch (err) {
      toastError('Could not load interview history.');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = filterType === 'All'
    ? reports
    : reports.filter(r => r.interviewType === filterType);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-brand-400" />
            <span>Interview Session History</span>
          </h1>
          <p className="text-sm text-slate-400">
            Review past mock interviews, scores, communication indicators, and progression over time.
          </p>
        </div>

        <Link
          to="/interview/config"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-accent text-white font-bold text-xs shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all self-start sm:self-auto"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>New Mock Interview</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['All', 'Mixed', 'Technical', 'Behavioral', 'Project-Based', 'HR'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterType(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === cat
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                : 'bg-dark-850 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sessions Grid */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-slate-800/40 animate-pulse" />
            ))}
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="space-y-3.5">
            {filteredReports.map((report) => (
              <div
                key={report._id}
                className="p-5 rounded-2xl bg-dark-850 hover:bg-dark-800 border border-slate-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center font-bold text-lg font-mono text-brand-400 shrink-0">
                    {report.overallScore}%
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{report.targetRole}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-mono">
                        {report.interviewType}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {report.questionsAnswered} questions answered • Speaking Pace: {report.communicationIndicators?.averageSpeakingPaceWpm || 120} WPM
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <Link
                    to={`/report/${report.sessionId?._id || report.sessionId}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-brand-500/20 text-slate-200 hover:text-brand-300 border border-slate-700 text-xs font-semibold transition-colors"
                  >
                    <span>View Scorecard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 space-y-3">
            <BrainCircuit className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm">No completed interview sessions found for this category.</p>
            <Link
              to="/interview/config"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Launch First Mock Interview</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}


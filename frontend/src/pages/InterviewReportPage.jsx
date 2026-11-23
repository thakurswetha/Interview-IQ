import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reportService } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  Award,
  Calendar,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Printer,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  MessageSquare,
  Sparkles,
  BookOpen,
  Layers,
  Activity,
  Loader2,
  TrendingUp
} from 'lucide-react';

export default function InterviewReportPage() {
  const { sessionId } = useParams();
  const { error: toastError } = useToast();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState(0);

  useEffect(() => {
    fetchReport();
  }, [sessionId]);

  const fetchReport = async () => {
    try {
      const res = await reportService.getBySessionId(sessionId);
      if (res.data.success) {
        setReport(res.data.report);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Could not load interview report.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-4 text-slate-300">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-sm font-medium">Synthesizing interview report & rubric analysis...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <p className="text-sm text-slate-400">Report not found. The interview may still be in progress.</p>
        <Link to="/history" className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Interview History</span>
        </Link>
      </div>
    );
  }

  const radarData = [
    { subject: 'Technical', score: report.categoryScores?.technicalKnowledge || 70, fullMark: 100 },
    { subject: 'Clarity', score: report.categoryScores?.communication || 75, fullMark: 100 },
    { subject: 'Relevance', score: report.categoryScores?.answerRelevance || 80, fullMark: 100 },
    { subject: 'STAR Method', score: report.categoryScores?.starStructure || 70, fullMark: 100 },
    { subject: 'Completeness', score: report.categoryScores?.problemSolving || 65, fullMark: 100 }
  ];

  const comm = report.communicationIndicators || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <Link to="/history" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Interview History</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-brand-400" />
            <span>Interview Performance Evaluation</span>
          </h1>
          <p className="text-xs text-slate-400">
            Official rubric scorecard synthesized from your answers, communication rhythm, and architectural explanations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-dark-800 hover:bg-dark-750 text-slate-200 text-xs font-semibold transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
          <Link
            to="/interview/config"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-500/25 transition-all"
          >
            <span>Practice Another Session</span>
          </Link>
        </div>
      </div>

      {/* Overview Metadata Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-2">
              <span>{report.interviewType} Interview</span> • <span>{report.difficulty} Seniority</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">{report.targetRole}</h2>
            <p className="text-xs text-slate-400 mt-1">
              Candidate: <span className="text-slate-200 font-semibold">{report.candidateName}</span> • Evaluated on: <span className="text-slate-200 font-semibold">{new Date(report.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </p>
          </div>

          {/* Overall Score Badge */}
          <div className="flex items-center gap-4 bg-dark-900/90 p-4 rounded-2xl border border-slate-800">
            <div className="text-right">
              <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold">Overall Score</span>
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-brand-300">{report.overallScore}</span>
              <span className="text-xs text-slate-500 font-mono"> / 100</span>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-lg ${
              report.overallScore >= 80 ? 'bg-emerald-600 shadow-emerald-500/20' :
              report.overallScore >= 65 ? 'bg-brand-600 shadow-brand-500/20' : 'bg-amber-600 shadow-amber-500/20'
            }`}>
              {report.overallScore >= 80 ? 'A' : report.overallScore >= 65 ? 'B' : 'C'}
            </div>
          </div>
        </div>

        {/* Visual Charts & Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Radar Chart */}
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Score Bars */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Category Competency Breakdown
            </h3>
            {radarData.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{cat.subject}</span>
                  <span className="font-mono text-white font-bold">{cat.score}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-dark-900 border border-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-1000"
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Communication Indicators Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div className="p-4 rounded-2xl bg-dark-850 border border-slate-800 text-center">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Average Speaking Pace</span>
            <div className="mt-1 flex items-baseline justify-center gap-1">
              <span className="text-2xl font-bold font-mono text-white">{comm.averageSpeakingPaceWpm || 120}</span>
              <span className="text-xs text-slate-400">WPM</span>
            </div>
            <span className="inline-block mt-1 text-[10px] text-emerald-400">Optimal Range: 110-150 WPM</span>
          </div>

          <div className="p-4 rounded-2xl bg-dark-850 border border-slate-800 text-center">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Filler Words Detected</span>
            <div className="mt-1 flex items-baseline justify-center gap-1">
              <span className="text-2xl font-bold font-mono text-white">{comm.totalFillerWords || 0}</span>
              <span className="text-xs text-slate-400">fillers</span>
            </div>
            <span className="inline-block mt-1 text-[10px] text-slate-400">("um", "like", "basically")</span>
          </div>

          <div className="p-4 rounded-2xl bg-dark-850 border border-slate-800 text-center">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Avg Answer Duration</span>
            <div className="mt-1 flex items-baseline justify-center gap-1">
              <span className="text-2xl font-bold font-mono text-white">{comm.averageAnswerDurationSeconds || 35}</span>
              <span className="text-xs text-slate-400">seconds</span>
            </div>
            <span className="inline-block mt-1 text-[10px] text-slate-400">Thorough articulation</span>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/25 bg-emerald-950/10 space-y-3">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>Demonstrated Strengths</span>
          </h3>
          <ul className="space-y-2">
            {(report.strengths || []).map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-rose-500/25 bg-rose-950/10 space-y-3">
          <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>Key Areas to Improve</span>
          </h3>
          <ul className="space-y-2">
            {(report.weaknesses || []).map((w, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Individual Question-by-Question Rubric Accordion */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-400" />
            <span>Question-by-Question Rubric Breakdown</span>
          </h3>
          <p className="text-xs text-slate-400">
            Compare what you said with the AI's objective rubric score, identified gaps, and recommended model response.
          </p>
        </div>

        <div className="space-y-4">
          {(report.questionFeedback || []).map((q, idx) => {
            const isExpanded = expandedQuestion === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-dark-850 overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                  className="p-4 sm:p-5 cursor-pointer flex items-center justify-between gap-4 hover:bg-dark-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-dark-900 border border-slate-700 flex items-center justify-center font-bold text-xs font-mono text-brand-400">
                      Q{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">{q.questionText}</h4>
                      <p className="text-[11px] text-slate-400">{q.category || 'Technical'} Question</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 font-mono text-xs font-bold">
                      {q.score}/100
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 border-t border-slate-800/80 bg-dark-900/60 space-y-4 text-xs">
                    {/* Candidate Transcript */}
                    <div className="p-3.5 rounded-xl bg-dark-850 border border-slate-800">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Your Recorded Answer:
                      </span>
                      <p className="text-slate-200 leading-relaxed italic">
                        "{q.candidateAnswer || '(No response captured)'}"
                      </p>
                    </div>

                    {/* AI Feedback */}
                    {q.feedback && (
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-400 mb-1">
                          Evaluator Notes:
                        </span>
                        <p className="text-slate-300 leading-relaxed">{q.feedback}</p>
                      </div>
                    )}

                    {/* Model Ideal Answer */}
                    {q.suggestedAnswer && (
                      <div className="p-4 rounded-xl bg-purple-950/15 border border-purple-500/20 text-purple-200 leading-relaxed">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1">
                          Recommended Model Answer:
                        </span>
                        <p>{q.suggestedAnswer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Topics & Personalized Next Steps */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span>Recommended Practice Curriculum</span>
        </h3>
        <p className="text-xs text-slate-400">
          Topics identified during this session where you can deepen technical nuances or architectural depth:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {(report.recommendedTopics || []).map((topic, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-dark-850 border border-slate-800 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs text-slate-200 font-medium">{topic}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


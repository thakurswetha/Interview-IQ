import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resumeService, interviewService, reportService } from '../services/api';
import {
  Play,
  FileText,
  Target,
  BarChart3,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BrainCircuit,
  ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resRes, intRes, anaRes] = await Promise.allSettled([
          resumeService.getAll(),
          interviewService.getAll(),
          reportService.getAnalytics()
        ]);

        if (resRes.status === 'fulfilled' && resRes.value.data.success) {
          setResumes(resRes.value.data.resumes || []);
        }

        if (intRes.status === 'fulfilled' && intRes.value.data.success) {
          setRecentSessions(intRes.value.data.sessions?.slice(0, 4) || []);
        }

        if (anaRes.status === 'fulfilled' && anaRes.value.data.success) {
          setAnalytics(anaRes.value.data);
        }
      } catch (err) {
        console.warn('[Dashboard] Data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const primaryResume = resumes.find(r => r.isPrimary) || resumes[0];
  const readinessScore = analytics?.summary?.averageScore || (recentSessions.length > 0 ? recentSessions[0].overallScore : 72);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-dark-850 via-dark-800 to-dark-850 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Career Readiness Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-white to-brand-300 bg-clip-text text-transparent">{user?.name || 'Candidate'}</span>!
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-xl">
              Targeting: <span className="text-slate-200 font-semibold">{user?.careerInterest || 'Full Stack Software Engineer'}</span> • Level: <span className="text-slate-200 font-semibold">{user?.experienceLevel || 'Beginner'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/interview/config"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent text-white text-sm font-bold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Mock Interview</span>
            </Link>
            <Link
              to="/resumes"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-slate-700 bg-dark-900/80 hover:bg-dark-700 text-slate-200 text-sm font-semibold transition-colors"
            >
              <FileText className="w-4 h-4 text-brand-400" />
              <span>Upload Resume</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Readiness Score</span>
            <div className="w-8 h-8 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
              <Award className="w-4 h-4 text-brand-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{readinessScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Based on rubric performance</span>
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Interviews Completed</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {analytics?.summary?.totalInterviews || recentSessions.filter(s => s.status === 'completed').length}
            </span>
            <span className="text-xs text-slate-400">sessions</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Across technical & behavioral types
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Extracted Skills</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {primaryResume ? (primaryResume.parsedSkills?.technical?.length || 0) + (primaryResume.parsedSkills?.tools?.length || 0) : 0}
            </span>
            <span className="text-xs text-slate-400">verified tags</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {primaryResume ? primaryResume.originalFileName : 'No resume uploaded yet'}
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">STAR Method Score</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {analytics?.categoryAverages?.starStructure || 78}%
            </span>
            <span className="text-xs text-slate-400">alignment</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Situation • Task • Action • Result
          </p>
        </div>
      </div>

      {/* Main Grid: Primary Resume Status & Recent Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white">Recent Mock Interviews</h3>
                <p className="text-xs text-slate-400">Review your past sessions, rubrics, and feedback</p>
              </div>
              <Link
                to="/history"
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                <span>View All History</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 rounded-xl bg-slate-800/40 animate-pulse" />
                ))}
              </div>
            ) : recentSessions.length > 0 ? (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div
                    key={session._id}
                    className="p-4 rounded-2xl bg-dark-800/60 hover:bg-dark-800 border border-slate-800/80 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                        <BrainCircuit className="w-5 h-5 text-brand-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{session.targetRole}</h4>
                        <p className="text-xs text-slate-400">
                          {session.interviewType} • {session.difficulty} • {session.questions?.length || 5} Questions
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-sm font-extrabold font-mono text-brand-300">
                          {session.overallScore ? `${session.overallScore}%` : 'In Progress'}
                        </span>
                        <p className="text-[10px] text-slate-500">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {session.status === 'completed' ? (
                        <Link
                          to={`/report/${session._id}`}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-brand-500/20 text-slate-200 hover:text-brand-300 border border-slate-700 text-xs font-semibold transition-colors"
                        >
                          View Report
                        </Link>
                      ) : (
                        <Link
                          to={`/interview/${session._id}`}
                          className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors"
                        >
                          Resume
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
                <BrainCircuit className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white mb-1">No Mock Interviews Completed Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  Take your first voice-based mock interview to receive detailed rubric scores and communication feedback.
                </p>
                <Link
                  to="/interview/config"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start First Interview</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Primary Resume & Quick Match */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Active Resume</h3>
              <Link to="/resumes" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
                Manage
              </Link>
            </div>

            {primaryResume ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-dark-800/80 border border-slate-700/60">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-brand-400 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-white truncate">{primaryResume.originalFileName}</p>
                      <p className="text-[10px] text-slate-400">{(primaryResume.fileSize / 1024).toFixed(1)} KB • Primary</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {primaryResume.summary || 'Resume parsed successfully.'}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Top Verified Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      ...(primaryResume.parsedSkills?.technical || []),
                      ...(primaryResume.parsedSkills?.frameworks || [])
                    ].slice(0, 8).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-dark-800 border border-slate-700 text-slate-300 text-[11px]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to={`/resume/${primaryResume._id}`}
                    className="block w-full py-2.5 text-center rounded-xl bg-dark-800 hover:bg-dark-750 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    Review Parsed Resume Data
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-4">No resume uploaded. Upload a PDF or DOCX to power AI questions.</p>
                <Link
                  to="/resumes"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Resume</span>
                </Link>
              </div>
            )}
          </div>

          {/* Job Matcher Callout */}
          <div className="p-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-dark-850 to-dark-800">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center mb-4">
              <Target className="w-5 h-5 text-sky-400" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Target Role Matcher</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Paste a job description from LinkedIn, Indeed, or AngelList to uncover missing skills and tailored study topics.
            </p>
            <Link
              to="/job-match"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300"
            >
              <span>Analyze Job Description</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


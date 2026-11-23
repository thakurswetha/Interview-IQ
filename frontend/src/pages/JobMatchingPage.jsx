import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { resumeService, jobService } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Target,
  FileText,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Play,
  Layers,
  BookOpen,
  Loader2,
  Info
} from 'lucide-react';

export default function JobMatchingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(location.state?.selectedResumeId || '');
  const [jobTitle, setJobTitle] = useState('Full Stack Software Engineer');
  const [company, setCompany] = useState('Tech Solutions Inc.');
  const [description, setDescription] = useState('');
  const [inputMode, setInputMode] = useState('paste'); // 'paste' | 'upload'
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [matchReport, setMatchReport] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await resumeService.getAll();
      if (res.data.success) {
        const list = res.data.resumes || [];
        setResumes(list);
        if (!selectedResumeId && list.length > 0) {
          const primary = list.find(r => r.isPrimary) || list[0];
          setSelectedResumeId(primary._id);
        }
      }
    } catch (err) {
      toastError('Could not load resumes.');
    } finally {
      setLoadingResumes(false);
    }
  };

  const handleLoadSampleJD = () => {
    setInputMode('paste');
    setJobTitle('Senior Full Stack Engineer');
    setCompany('Stripe / CloudScale Technologies');
    setDescription(`About the Role:
We are looking for a Senior Full Stack Engineer to build next-generation financial APIs and web dashboards.

Key Responsibilities:
- Architect and develop high-throughput, low-latency microservices using Node.js, TypeScript, and Express.
- Build responsive, accessible frontends using React, Next.js, and Tailwind CSS.
- Optimize complex database queries in PostgreSQL and manage document storage in MongoDB.
- Containerize applications using Docker and set up automated CI/CD deployment pipelines on AWS.
- Collaborate with product teams using Agile methodologies and deliver clean, well-tested code (Jest/Cypress).

Requirements:
- 2+ years of professional full-stack development experience.
- Strong proficiency in JavaScript/TypeScript, React, Node.js, and SQL.
- Practical experience with Docker, Git, REST APIs, and System Design.
- Exceptional problem-solving and communication skills.`);
  };

  const handleJDFileUpload = async (file) => {
    if (!file) return;
    setUploadedFileName(file.name);
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('jobFile', file);
      formData.append('jobTitle', jobTitle);
      formData.append('company', company);

      const res = await jobService.uploadDocument(formData);
      if (res.data.success && res.data.job) {
        setDescription(res.data.job.description);
        setJobTitle(res.data.job.jobTitle);
        success('Job description file parsed successfully! Ready for match analysis.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to parse job description file.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyzeMatch = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) {
      toastError('Please select a resume to match against.');
      return;
    }
    if (!description.trim() || !jobTitle.trim()) {
      toastError('Please enter the target job title and job description text.');
      return;
    }

    setAnalyzing(true);
    try {
      // 1. Create or save the job description
      const jobRes = await jobService.create({
        jobTitle,
        company,
        description
      });

      if (jobRes.data.success && jobRes.data.job) {
        const createdJobId = jobRes.data.job._id;
        // 2. Run match analysis against the selected resume
        const matchRes = await jobService.match(createdJobId, { resumeId: selectedResumeId });
        if (matchRes.data.success) {
          setMatchReport(matchRes.data);
          success('Skill match analysis generated!');
        }
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Match analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Target className="w-6 h-6 text-brand-400" />
          <span>Job Description Match Engine</span>
        </h1>
        <p className="text-sm text-slate-400">
          Compare your resume skills directly against any job requirements. Discover missing skills, preparation topics, and suggested interview focus areas.
        </p>
      </div>

      {/* Input Configuration Panel */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInputMode('paste')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                inputMode === 'paste'
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                  : 'bg-dark-850 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Paste Job Description
            </button>
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                inputMode === 'upload'
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                  : 'bg-dark-850 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Upload JD Document (PDF/DOCX)
            </button>
          </div>

          <button
            type="button"
            onClick={handleLoadSampleJD}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-500/30 bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Load Sample Full Stack JD</span>
          </button>
        </div>

        <form onSubmit={handleAnalyzeMatch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Resume for Comparison
              </label>
              {loadingResumes ? (
                <div className="h-10 rounded-xl bg-slate-800 animate-pulse" />
              ) : resumes.length > 0 ? (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                >
                  {resumes.map(r => (
                    <option key={r._id} value={r._id}>
                      {r.originalFileName} {r.isPrimary ? '(Primary)' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs text-rose-400 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  No resume uploaded. <Link to="/resumes" className="underline font-bold">Upload one first.</Link>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Role / Title
              </label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Company
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google, Stripe, or Stealth Startup"
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {inputMode === 'upload' ? (
            <div className="p-6 border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-2xl bg-dark-850 text-center transition-colors">
              <input
                type="file"
                id="jdFileInput"
                accept=".pdf,.docx,.doc,.txt"
                onChange={(e) => e.target.files?.[0] && handleJDFileUpload(e.target.files[0])}
                className="hidden"
              />
              <label htmlFor="jdFileInput" className="cursor-pointer space-y-2 block">
                <FileText className="w-10 h-10 text-brand-400 mx-auto" />
                <p className="text-xs font-bold text-white">
                  {uploadedFileName ? `Uploaded: ${uploadedFileName}` : 'Click to select Job Description document (PDF or DOCX)'}
                </p>
                <p className="text-[11px] text-slate-400">
                  We'll extract requirements and responsibilities automatically.
                </p>
              </label>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Job Description Text (Paste full JD with requirements & responsibilities)
              </label>
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste the job description from LinkedIn, Indeed, or the company careers portal..."
                className="w-full bg-dark-850 border border-slate-700 rounded-xl p-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-brand-500"
              />
            </div>
          )}

          {inputMode === 'upload' && description && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Extracted Text Preview:
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-dark-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-300 font-mono leading-relaxed"
              />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={analyzing || !selectedResumeId}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent text-white font-bold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 disabled:opacity-50 transition-all"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Comparing Skills & Requirements...</span>
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  <span>Analyze Skill Match</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Match Results Display */}
      {matchReport && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Top Score Banner */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-dark-850 via-dark-800 to-dark-850">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative w-24 h-24 rounded-full bg-dark-900 border-4 border-slate-800 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={
                        matchReport.matchPercentage >= 75 ? 'text-emerald-400' :
                        matchReport.matchPercentage >= 50 ? 'text-brand-400' : 'text-amber-400'
                      }
                      strokeDasharray={`${matchReport.matchPercentage}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-extrabold text-white font-mono">{matchReport.matchPercentage}%</span>
                    <span className="block text-[9px] text-slate-400 uppercase font-semibold">Match</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">
                    {matchReport.jobTitle}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comparing against resume: <span className="text-brand-300 font-semibold">{matchReport.resumeFileName}</span>
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-300">
                    <span className="font-semibold text-emerald-400">{matchReport.matchedSkills?.length || 0} matched</span> •
                    <span className="font-semibold text-amber-400">{matchReport.partiallyMatchedSkills?.length || 0} related</span> •
                    <span className="font-semibold text-rose-400">{matchReport.missingSkills?.length || 0} missing</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/interview/config"
                  state={{
                    selectedResumeId,
                    targetRole: matchReport.jobTitle,
                    targetCompany: matchReport.company
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-accent text-white font-bold text-sm shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Mock Interview for This Role</span>
                </Link>
              </div>
            </div>

            {/* Disclaimer pill */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-start gap-2 text-xs text-slate-400">
              <Info className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <p>{matchReport.disclaimer}</p>
            </div>
          </div>

          {/* Breakdown: Matched, Partially Matched, Missing Skills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Matched */}
            <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-emerald-950/10 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h4 className="text-sm font-bold">Directly Matched Skills</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(matchReport.matchedSkills || []).map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                    {skill}
                  </span>
                ))}
                {(!matchReport.matchedSkills || matchReport.matchedSkills.length === 0) && (
                  <p className="text-xs text-slate-500 italic">No direct keyword skill matches detected.</p>
                )}
              </div>
            </div>

            {/* Partially Matched */}
            <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-amber-950/10 space-y-3">
              <div className="flex items-center gap-2 text-amber-400">
                <HelpCircle className="w-5 h-5" />
                <h4 className="text-sm font-bold">Related / Partial Skills</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(matchReport.partiallyMatchedSkills || []).map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium">
                    {skill}
                  </span>
                ))}
                {(!matchReport.partiallyMatchedSkills || matchReport.partiallyMatchedSkills.length === 0) && (
                  <p className="text-xs text-slate-500 italic">No partial/bridge skills required.</p>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 bg-rose-950/10 space-y-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="w-5 h-5" />
                <h4 className="text-sm font-bold">Missing Core Skills</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(matchReport.missingSkills || []).map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
                    {skill}
                  </span>
                ))}
                {(!matchReport.missingSkills || matchReport.missingSkills.length === 0) && (
                  <p className="text-xs text-emerald-400 font-medium">No missing skills detected! 100% covered.</p>
                )}
              </div>
            </div>
          </div>

          {/* Recommended Preparation Curriculum & Focus Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-400" />
                <span>Recommended Topics to Prepare</span>
              </h4>
              <ul className="space-y-2">
                {(matchReport.recommendedTopics || []).map((topic, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0 mt-1.5" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Suggested Interview Focus Areas</span>
              </h4>
              <ul className="space-y-2">
                {(matchReport.focusAreas || []).map((area, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 mt-1.5" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


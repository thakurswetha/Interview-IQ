import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { resumeService, interviewService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { JOB_CATEGORIES, JOB_ROLES } from '../utils/jobRoles';
import {
  Play,
  Settings2,
  FileText,
  Briefcase,
  Sliders,
  Users,
  Video,
  Mic,
  BrainCircuit,
  Loader2,
  Sparkles,
  CheckCircle2,
  Search,
  Filter,
  PlusCircle,
  Code2,
  Database,
  Cpu,
  Cloud,
  ShieldCheck,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function InterviewConfigPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(location.state?.selectedResumeId || '');

  // Role Selection State
  const initialRole = location.state?.targetRole || 'Full Stack Developer';
  const matchingInitial = JOB_ROLES.find(r => r.name.toLowerCase() === initialRole.toLowerCase());
  const [selectedRoleName, setSelectedRoleName] = useState(matchingInitial ? matchingInitial.name : initialRole);
  const [isCustomRole, setIsCustomRole] = useState(!matchingInitial && initialRole !== 'Full Stack Developer');
  const [customRoleInput, setCustomRoleInput] = useState(!matchingInitial ? initialRole : '');
  const [selectedCategory, setSelectedCategory] = useState('All Roles');
  const [searchQuery, setSearchQuery] = useState('');

  const [interviewType, setInterviewType] = useState(location.state?.interviewType || 'Mixed');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [selectedPersona, setSelectedPersona] = useState('alex');
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  const personas = [
    {
      id: 'alex',
      name: 'Alex Morgan',
      title: 'Principal Technical Architect & AI Lead',
      description: 'Rigorous technical focus on algorithms, distributed architecture, and pragmatic coding trade-offs.',
      avatarStyle: 'modern-tech'
    },
    {
      id: 'sarah',
      name: 'Sarah Chen',
      title: 'Director of Talent & Engineering Culture',
      description: 'Specializes in behavioral STAR framework, leadership empathy, cross-functional collaboration, and culture fit.',
      avatarStyle: 'executive'
    },
    {
      id: 'david',
      name: 'David Kim',
      title: 'Staff Systems & Product Engineer',
      description: 'Evaluates real-world system resilience, edge cases, project deep-dives, and performance bottlenecks.',
      avatarStyle: 'studio'
    }
  ];

  const types = [
    { id: 'Mixed', name: 'Mixed (Comprehensive)', desc: 'Balanced blend of technical domain questions, system architecture, and behavioral STAR questions.' },
    { id: 'Technical', name: 'Technical Interview', desc: 'Focus on coding patterns, database queries, async lifecycle, and system design.' },
    { id: 'Behavioral', name: 'Behavioral (STAR Method)', desc: 'Conflict resolution, leadership, failure recovery, and real project experiences.' },
    { id: 'Project-Based', name: 'Project-Based Deep Dive', desc: 'Detailed probing into your resume projects, architecture decisions, and scaling.' },
    { id: 'HR', name: 'HR & Cultural Alignment', desc: 'Career trajectory, compensation expectations, team work ethic, and motivation.' }
  ];

  const difficulties = [
    { id: 'Beginner', label: 'Beginner (Junior / Entry-Level)', badge: '0-1 yrs' },
    { id: 'Intermediate', label: 'Intermediate (Mid-Level)', badge: '1-3 yrs' },
    { id: 'Advanced', label: 'Advanced (Senior / Lead)', badge: '3+ yrs' }
  ];

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
      setLoading(false);
    }
  };

  // Filtered Job Roles based on category and search query
  const filteredRoles = useMemo(() => {
    return JOB_ROLES.filter((role) => {
      const matchesCategory = selectedCategory === 'All Roles' || role.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        role.name.toLowerCase().includes(q) ||
        role.category.toLowerCase().includes(q) ||
        role.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleSelectPredefinedRole = (role) => {
    setIsCustomRole(false);
    setSelectedRoleName(role.name);
  };

  const handleSelectCustomRole = () => {
    setIsCustomRole(true);
    setSelectedRoleName('Custom Role');
  };

  const effectiveTargetRole = isCustomRole ? customRoleInput.trim() : selectedRoleName;

  const handleStartInterview = async (e) => {
    e.preventDefault();

    if (isCustomRole && !customRoleInput.trim()) {
      toastError('Please enter your custom job title.');
      return;
    }

    if (!effectiveTargetRole) {
      toastError('Please select or specify a target role.');
      return;
    }

    if (!selectedResumeId && resumes.length > 0) {
      toastError('Please select a resume to ground your interview questions.');
      return;
    }

    setInitializing(true);
    const chosenPersona = personas.find(p => p.id === selectedPersona) || personas[0];

    try {
      const res = await interviewService.start({
        resumeId: selectedResumeId || undefined,
        targetRole: effectiveTargetRole,
        interviewType,
        difficulty,
        totalQuestionsTarget: parseInt(totalQuestions, 10),
        interviewerPersona: {
          name: chosenPersona.name,
          title: chosenPersona.title,
          avatarStyle: chosenPersona.avatarStyle
        }
      });

      if (res.data.success && res.data.session) {
        success(`Interview configured for ${effectiveTargetRole}! Entering live room...`);
        navigate(`/interview/${res.data.session._id}`);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to start interview.');
      setInitializing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Settings2 className="w-7 h-7 text-brand-400" />
          <span>Configure Your AI Mock Interview</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Select from 30+ domain job roles or specify a custom role. Customize interviewer persona, difficulty, and duration.
        </p>
      </div>

      <form onSubmit={handleStartInterview} className="space-y-8">
        {/* Step 1: Target Job Role Selection (Expanded & Searchable) */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-brand-400">
                <Briefcase className="w-4 h-4" />
                <span>1. Select Target Job Role</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Questions will be dynamically synthesized to evaluate skills relevant to this specific discipline.
              </p>
            </div>

            {/* Currently selected badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-500/15 border border-brand-500/30 text-xs font-semibold text-brand-300">
              <span className="text-slate-400">Active:</span>
              <span className="text-white font-bold">{effectiveTargetRole || 'None Selected'}</span>
            </div>
          </div>

          {/* Search bar & Category filter pills */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search job roles (e.g., Data Analyst, Java, DevOps, QA, Product)..."
                className="w-full bg-dark-850 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {JOB_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm font-semibold'
                        : 'bg-dark-800 text-slate-400 hover:text-slate-200 hover:bg-dark-750 border border-slate-750'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredRoles.map((role) => {
              const isSelected = !isCustomRole && selectedRoleName === role.name;
              return (
                <div
                  key={role.id}
                  onClick={() => handleSelectPredefinedRole(role)}
                  className={`cursor-pointer p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-500 bg-brand-500/15 shadow-md shadow-brand-500/10 ring-1 ring-brand-500/50'
                      : 'border-slate-800 bg-dark-850/80 hover:border-slate-700 hover:bg-dark-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-dark-900 text-brand-300 border border-slate-750">
                        {role.category}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />}
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{role.name}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {role.description}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Custom Role Option Card */}
            <div
              onClick={handleSelectCustomRole}
              className={`cursor-pointer p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                isCustomRole
                  ? 'border-brand-500 bg-brand-500/15 shadow-md shadow-brand-500/10 ring-1 ring-brand-500/50'
                  : 'border-dashed border-slate-700 bg-dark-850/40 hover:border-brand-500/60 hover:bg-dark-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-dark-900 text-purple-300 border border-slate-700">
                    Custom Specification
                  </span>
                  {isCustomRole && <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />}
                </div>
                <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5 text-purple-400" />
                  <span>Other / Custom Job Role</span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Enter your unique target job title (e.g. Embedded Engineer, Game Developer, Security Architect).
                </p>
              </div>
            </div>
          </div>

          {/* Custom Role Input Box (Visible when Custom Role is selected) */}
          {isCustomRole && (
            <div className="p-4 rounded-2xl bg-dark-850 border border-purple-500/40 space-y-2 animate-fade-in">
              <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider">
                Enter Your Custom Job Role Title
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required={isCustomRole}
                  value={customRoleInput}
                  onChange={(e) => setCustomRoleInput(e.target.value)}
                  placeholder="e.g. Embedded Firmware Engineer or Blockchain Core Developer"
                  className="flex-1 bg-dark-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-400"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                The AI will dynamically generate customized technical and behavioral interview questions tailored to "{customRoleInput || 'your custom role'}".
              </p>
            </div>
          )}

          {/* Resume Selection */}
          <div className="border-t border-slate-800/80 pt-5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Candidate Resume Grounding
            </label>
            {loading ? (
              <div className="h-10 rounded-xl bg-slate-800 animate-pulse" />
            ) : resumes.length > 0 ? (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
              >
                {resumes.map(r => (
                  <option key={r._id} value={r._id}>
                    {r.originalFileName} {r.isPrimary ? '(Primary Resume)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs text-amber-400 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
                <span>No resume uploaded yet. Default standard software engineering profile will be used.</span>
                <Link to="/resumes" className="underline font-bold text-amber-300 ml-2">Upload Resume</Link>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Interview Type */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-brand-400">
            <span>2. Select Interview Category</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {types.map((type) => {
              const selected = interviewType === type.id;
              return (
                <div
                  key={type.id}
                  onClick={() => setInterviewType(type.id)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                    selected
                      ? 'border-brand-500 bg-brand-500/15 shadow-lg shadow-brand-500/10 scale-[1.01]'
                      : 'border-slate-800 bg-dark-850 hover:border-slate-700 hover:bg-dark-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-sm font-bold text-white">{type.name}</h4>
                    {selected && <CheckCircle2 className="w-4 h-4 text-brand-400" />}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{type.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Difficulty & Length */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-brand-400">
            <span>3. Difficulty & Duration</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Seniority / Difficulty Level
              </label>
              <div className="space-y-2">
                {difficulties.map((diff) => (
                  <div
                    key={diff.id}
                    onClick={() => setDifficulty(diff.id)}
                    className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between transition-colors ${
                      difficulty === diff.id
                        ? 'border-brand-500 bg-brand-500/15 text-white'
                        : 'border-slate-800 bg-dark-850 text-slate-400 hover:text-white hover:bg-dark-800'
                    }`}
                  >
                    <span className="text-xs font-semibold">{diff.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-dark-900 border border-slate-700 font-mono">
                      {diff.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Total Questions Target: <span className="text-brand-400 font-bold font-mono">{totalQuestions} questions</span>
              </label>
              <input
                type="range"
                min="3"
                max="8"
                step="1"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(e.target.value)}
                className="w-full accent-brand-500 cursor-pointer h-2 bg-dark-900 rounded-lg appearance-none mt-3"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                <span>3 (Quick drill ~10m)</span>
                <span>5 (Standard ~20m)</span>
                <span>8 (In-depth ~35m)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: AI Interviewer Persona */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-brand-400">
            <span>4. Choose AI Interviewer Persona</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {personas.map((persona) => {
              const selected = selectedPersona === persona.id;
              return (
                <div
                  key={persona.id}
                  onClick={() => setSelectedPersona(persona.id)}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    selected
                      ? 'border-brand-500 bg-brand-500/15 shadow-xl shadow-brand-500/10 scale-[1.02]'
                      : 'border-slate-800 bg-dark-850 hover:border-slate-700 hover:bg-dark-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                        {persona.name.charAt(0)}
                      </div>
                      {selected && <CheckCircle2 className="w-5 h-5 text-brand-400" />}
                    </div>

                    <h4 className="text-sm font-bold text-white">{persona.name}</h4>
                    <p className="text-[11px] text-brand-300 font-medium mb-2">{persona.title}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{persona.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Launch Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={initializing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent text-white font-bold text-base shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-[1.02] disabled:opacity-50 transition-all cursor-pointer"
          >
            {initializing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Adaptive Questions for {effectiveTargetRole}...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Launch Mock Interview for {effectiveTargetRole}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

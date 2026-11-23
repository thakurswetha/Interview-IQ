import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { resumeService } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  FileText,
  Award,
  GraduationCap,
  Briefcase,
  Layers,
  Sparkles,
  Save,
  Plus,
  X,
  ArrowLeft,
  Play,
  Target,
  Loader2,
  Check
} from 'lucide-react';

export default function ResumeAnalysisPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState({ category: 'technical', value: '' });

  useEffect(() => {
    fetchResume();
  }, [id]);

  const fetchResume = async () => {
    try {
      const res = await resumeService.getById(id);
      if (res.data.success) {
        setResume(res.data.resume);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Could not load resume data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (category) => {
    if (!newSkill.value.trim()) return;
    const current = resume.parsedSkills?.[category] || [];
    if (!current.includes(newSkill.value.trim())) {
      setResume({
        ...resume,
        parsedSkills: {
          ...resume.parsedSkills,
          [category]: [...current, newSkill.value.trim()]
        }
      });
    }
    setNewSkill({ category, value: '' });
  };

  const handleRemoveSkill = (category, skillToRemove) => {
    setResume({
      ...resume,
      parsedSkills: {
        ...resume.parsedSkills,
        [category]: resume.parsedSkills[category].filter(s => s !== skillToRemove)
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await resumeService.update(id, {
        parsedSkills: resume.parsedSkills,
        parsedEducation: resume.parsedEducation,
        parsedProjects: resume.parsedProjects,
        parsedExperience: resume.parsedExperience,
        summary: resume.summary,
        isPrimary: resume.isPrimary
      });
      if (res.data.success) {
        success('Resume data corrections saved successfully!');
        setResume(res.data.resume);
      }
    } catch (err) {
      toastError('Failed to save resume corrections.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        <p className="text-xs font-medium">Loading extracted resume analysis...</p>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <p className="text-sm text-slate-400">Resume not found or unauthorized.</p>
        <Link to="/resumes" className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Resumes</span>
        </Link>
      </div>
    );
  }

  const skillCategories = [
    { key: 'technical', label: 'Technical Languages & Core Skills', color: 'border-brand-500/30 bg-brand-500/10 text-brand-300' },
    { key: 'frameworks', label: 'Frameworks & Libraries', color: 'border-purple-500/30 bg-purple-500/10 text-purple-300' },
    { key: 'tools', label: 'Databases, Cloud & Dev Tools', color: 'border-sky-500/30 bg-sky-500/10 text-sky-300' },
    { key: 'softSkills', label: 'Communication & Leadership', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/resumes" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Resumes</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{resume.originalFileName}</span>
            {resume.isPrimary && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
                Primary
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400">
            Review and correct the AI-extracted qualifications to ensure maximum accuracy in your mock interview.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Corrections</span>
          </button>

          <Link
            to="/job-match"
            state={{ selectedResumeId: resume._id }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-dark-800 hover:bg-dark-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Target className="w-4 h-4 text-sky-400" />
            <span>Match with Job</span>
          </Link>

          <Link
            to="/interview/config"
            state={{ selectedResumeId: resume._id }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/25 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Mock Interview</span>
          </Link>
        </div>
      </div>

      {/* Summary Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">
          Candidate Overview / Extracted Summary
        </h3>
        <textarea
          rows={3}
          value={resume.summary || ''}
          onChange={(e) => setResume({ ...resume, summary: e.target.value })}
          className="w-full bg-dark-850 border border-slate-700/80 rounded-xl p-3 text-xs sm:text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-brand-500 transition-colors"
          placeholder="Summary of candidate qualifications..."
        />
      </div>

      {/* Skills Grid */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-400" />
            <span>Extracted Skills & Competencies</span>
          </h3>
          <span className="text-xs text-slate-400">Click ‘×’ on any tag to remove, or add new below</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skillCategories.map(({ key, label, color }) => {
            const list = resume.parsedSkills?.[key] || [];
            return (
              <div key={key} className="p-5 rounded-2xl bg-dark-850/80 border border-slate-800 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 mb-3">{label}</h4>
                  <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                    {list.map((skill, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${color}`}
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(key, skill)}
                          className="hover:text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {list.length === 0 && (
                      <span className="text-xs text-slate-500 italic">No skills listed under this category.</span>
                    )}
                  </div>
                </div>

                {/* Add Skill Input */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                  <input
                    type="text"
                    placeholder={`Add ${key} skill...`}
                    value={newSkill.category === key ? newSkill.value : ''}
                    onChange={(e) => setNewSkill({ category: key, value: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(key)}
                    className="flex-1 bg-dark-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(key)}
                    className="p-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-slate-200 hover:text-white text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Projects & Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Projects */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <span>Extracted Projects</span>
          </h3>

          <div className="space-y-3">
            {(resume.parsedProjects || []).map((proj, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-dark-850 border border-slate-800">
                <h4 className="text-xs font-bold text-white">{proj.title}</h4>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">{proj.description}</p>
                {proj.technologies?.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {proj.technologies.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-dark-800 text-[10px] text-brand-300 font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {(!resume.parsedProjects || resume.parsedProjects.length === 0) && (
              <p className="text-xs text-slate-500 italic">No specific projects detected.</p>
            )}
          </div>
        </div>

        {/* Experience & Education */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
              <span>Education</span>
            </h3>
            <div className="space-y-2">
              {(resume.parsedEducation || []).map((edu, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-dark-850 border border-slate-800">
                  <h4 className="text-xs font-bold text-white">{edu.degree}</h4>
                  <p className="text-[11px] text-slate-400">{edu.institution} • {edu.year}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <Briefcase className="w-5 h-5 text-amber-400" />
              <span>Work Experience</span>
            </h3>
            <div className="space-y-2">
              {(resume.parsedExperience || []).map((exp, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-dark-850 border border-slate-800">
                  <h4 className="text-xs font-bold text-white">{exp.role}</h4>
                  <p className="text-[11px] text-slate-400">{exp.company} • {exp.duration}</p>
                </div>
              ))}
              {(!resume.parsedExperience || resume.parsedExperience.length === 0) && (
                <p className="text-xs text-slate-500 italic">No formal employment entries extracted.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


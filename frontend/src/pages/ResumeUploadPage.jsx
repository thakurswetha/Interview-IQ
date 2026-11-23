import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resumeService } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Plus
} from 'lucide-react';

export default function ResumeUploadPage() {
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await resumeService.getAll();
      if (res.data.success) {
        setResumes(res.data.resumes || []);
      }
    } catch (err) {
      toastError('Could not fetch resumes.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    const validExts = ['.pdf', '.docx'];
    const fileName = file.name.toLowerCase();
    const isValid = validExts.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      toastError('Only PDF and DOCX resume files are supported.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toastError('File size exceeds the 10MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    try {
      const res = await resumeService.upload(formData);
      if (res.data.success) {
        success('Resume uploaded and parsed successfully.');
        await fetchResumes();
        if (res.data.resume?._id) {
          navigate(`/resume/${res.data.resume._id}`);
        }
      }
    } catch (err) {
      toastError(err.response?.data?.message || err.message || 'Error uploading resume.');
    } finally {
      setUploading(false);
    }
  };

  // Helper: Create a sample mock resume file with valid PDF structure for testing
  const handleLoadSampleResume = async () => {
    setUploading(true);
    try {
      const lines = [
        'Alex Turner',
        'Senior Software Engineer and Full Stack Developer',
        'Email: alex.turner@example.com | Phone: 555-019-2834 | GitHub: github.com/alexturner',
        'PROFESSIONAL SUMMARY',
        'Full Stack Engineer with 3+ years experience designing scalable web services and React frontends.',
        'TECHNICAL SKILLS',
        'Languages: JavaScript, TypeScript, Python, SQL, HTML5, CSS3',
        'Frameworks: React, Node.js, Express, Next.js, Redux, Tailwind CSS',
        'Tools and Cloud: PostgreSQL, MongoDB, Redis, Docker, AWS, Git, CI/CD',
        'EDUCATION',
        'Bachelor of Science in Computer Science | State University | 2020 - 2024',
        'PROJECTS',
        'Cloud InterviewIQ Platform: Built full stack real-time interview system using React, Node.js, MongoDB.',
        'High-Throughput E-Commerce API: Designed microservice architecture handling 12000 requests per minute using Redis and PostgreSQL.',
        'WORK EXPERIENCE',
        'Software Engineer Intern | InnovateTech Labs | 2023 - 2024',
        'Implemented 15+ RESTful endpoints and integrated Docker containers for team CI/CD pipeline.'
      ];

      let streamContent = 'BT /F1 10 Tf 40 750 Td 14 TL ';
      lines.forEach((l, i) => {
        const escaped = l.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
        if (i > 0) streamContent += 'T* ';
        streamContent += '(' + escaped + ') Tj ';
      });
      streamContent += 'ET';

      const stream = `<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream`;
      const pdfString = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n${stream}\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000266 00000 n \n0000000373 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n550\n%%EOF`;

      const blob = new Blob([pdfString], { type: 'application/pdf' });
      const sampleFile = new File([blob], 'Alex_Turner_Software_Engineer_Resume.pdf', { type: 'application/pdf' });

      await handleFileUpload(sampleFile);
    } catch (err) {
      toastError('Could not load sample resume.');
      setUploading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete resume "${name}"?`)) {
      try {
        await resumeService.delete(id);
        success('Resume deleted.');
        setResumes(resumes.filter(r => r._id !== id));
      } catch (err) {
        toastError('Failed to delete resume.');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Resume Intelligence</h1>
          <p className="text-sm text-slate-400">
            Upload your PDF or DOCX resume to extract verified skills, education, projects, and work experience.
          </p>
        </div>

        {/* Instant sample candidate resume */}
        <button
          onClick={handleLoadSampleResume}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-500/30 bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 text-xs font-semibold transition-colors disabled:opacity-50"
          title="Instant mock resume for evaluation"
        >
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Load Sample Candidate Resume</span>
        </button>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all ${
          dragActive
            ? 'border-brand-400 bg-brand-500/10 scale-[1.01]'
            : 'border-slate-700/80 hover:border-slate-500 bg-dark-850/60 hover:bg-dark-850'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center mx-auto text-brand-400">
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-white">
              {uploading ? 'Analyzing and Extracting Resume...' : 'Drop your resume here, or browse files'}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Supports PDF and DOCX files up to 10MB. Text parsing and keyword extraction run automatically.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dark-800 border border-slate-700 text-[11px] text-slate-300">
            <span>Encrypted & Private to Your Account</span>
          </div>
        </div>
      </div>

      {/* Uploaded Resumes List */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Your Saved Resumes</h3>
          <span className="text-xs text-slate-400 font-mono">{resumes.length} total</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-16 rounded-xl bg-slate-800/40 animate-pulse" />
            ))}
          </div>
        ) : resumes.length > 0 ? (
          <div className="space-y-3">
            {resumes.map((resume) => {
              const techCount = (resume.parsedSkills?.technical?.length || 0) + (resume.parsedSkills?.frameworks?.length || 0);
              return (
                <div
                  key={resume._id}
                  className="p-4 sm:p-5 rounded-2xl bg-dark-800/70 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white truncate max-w-xs">{resume.originalFileName}</h4>
                        {resume.isPrimary && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {techCount} extracted skills • {resume.parsedProjects?.length || 0} projects • {(resume.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-auto">
                    <Link
                      to={`/resume/${resume._id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-colors"
                    >
                      <span>View & Edit Parsed Data</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => handleDelete(resume._id, resume.originalFileName)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700/60 transition-colors"
                      title="Delete resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs">No resumes uploaded yet. Drag and drop your first resume above or click "Load Sample Resume".</p>
          </div>
        )}
      </div>
    </div>
  );
}


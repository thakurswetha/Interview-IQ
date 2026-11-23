import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Shield, Award, Terminal, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-dark-950 text-slate-400 text-xs py-12 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600/30 border border-brand-500/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-brand-400" />
              </div>
              <span className="font-bold text-base text-white">Interview<span className="text-brand-400">IQ</span></span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              AI-Powered Personalized Mock Interview and Career Readiness Platform built for students, graduates, and aspiring software engineers.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              All Systems Operational
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Core Modules</h4>
            <ul className="space-y-2">
              <li><Link to="/resumes" className="hover:text-white transition-colors">Resume Intelligence & Parsing</Link></li>
              <li><Link to="/job-match" className="hover:text-white transition-colors">Job Description Matcher</Link></li>
              <li><Link to="/interview/config" className="hover:text-white transition-colors">AI Mock Interview Suite</Link></li>
              <li><Link to="/analytics" className="hover:text-white transition-colors">Performance Analytics</Link></li>
              <li><Link to="/recommendations" className="hover:text-white transition-colors">Personalized Prep Plan</Link></li>
            </ul>
          </div>

          {/* Standards & Transparency */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Evaluation Rubrics</h4>
            <ul className="space-y-2">
              <li><span className="text-slate-300 font-medium">Technical Correctness</span>: In-depth syntax & architecture</li>
              <li><span className="text-slate-300 font-medium">STAR Framework</span>: Behavioral answer scoring</li>
              <li><span className="text-slate-300 font-medium">Communication Indicators</span>: Speaking pace & filler words</li>
              <li><span className="text-slate-300 font-medium">Explainable Match</span>: Transparent skill overlap %</li>
            </ul>
          </div>

          {/* Enterprise & Security */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Enterprise & Security</h4>
            <p className="text-slate-400 leading-relaxed mb-3">
              Built on secure multi-tenant cloud architecture with encrypted candidate data isolation and transparent AI evaluation standards.
            </p>
            <div className="p-3 rounded-xl bg-dark-900 border border-slate-800 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Security:</span>
                <span className="text-slate-300 font-mono">End-to-End Encrypted</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Privacy:</span>
                <span className="text-slate-300 font-mono">Isolated Tenancy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Platform:</span>
                <span className="text-brand-400 font-mono">v1.2.0 Enterprise SaaS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} InterviewIQ Platform. All rights reserved. Candidate data is private and securely isolated.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Precision AI Interview Intelligence & Career Readiness
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}


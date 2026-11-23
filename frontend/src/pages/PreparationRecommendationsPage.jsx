import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../services/api';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Play,
  ArrowRight,
  ExternalLink,
  Target,
  BrainCircuit,
  Code2,
  FileCheck2,
  Layers
} from 'lucide-react';

export default function PreparationRecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await reportService.getAnalytics();
        if (res.data.success) {
          setRecommendations(res.data.topRecommendations || []);
          setWeaknesses(res.data.recurringWeaknesses || []);
        }
      } catch (err) {
        console.warn('Could not fetch recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecs();
  }, []);

  const curriculumModules = [
    {
      title: 'STAR Behavioral Framework Mastery',
      category: 'Behavioral & Leadership',
      description: 'Format real-world project challenges into punchy Situation, Task, Action, and measured Result stories.',
      status: 'High Priority',
      topics: ['Structuring 90-second answers', 'Highlighting personal contribution vs team', 'Quantifying impact with metrics']
    },
    {
      title: 'Distributed System Design Patterns',
      category: 'Architecture & Scalability',
      description: 'Master rate limiting, caching with Redis, asynchronous queues, and database sharding trade-offs.',
      status: 'Core Technical',
      topics: ['ACID vs BASE consistency', 'API idempotency with UUID keys', 'Horizontal scaling bottlenecks']
    },
    {
      title: 'Vocal Economy & Pacing Control',
      category: 'Communication Indicator',
      description: 'Eliminate filler hesitation words ("um", "like", "basically") by adopting deliberate silent pauses.',
      status: 'Delivery Mastery',
      topics: ['Pacing between 110-150 WPM', 'Silent pause technique', 'Summarizing upfront before detailing']
    },
    {
      title: 'SQL Indexing & Query Profiling',
      category: 'Database Optimization',
      description: 'Explain B-Tree execution plans, composite indexes, and eliminating full table scans on large tables.',
      status: 'Recommended',
      topics: ['EXPLAIN ANALYZE deep dive', 'Covering indexes', 'Connection pooling best practices']
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-brand-400" />
            <span>Personalized Preparation Curriculum</span>
          </h1>
          <p className="text-sm text-slate-400">
            Targeted study modules and practice tracks derived from your interview performance and missing skill gaps.
          </p>
        </div>

        <Link
          to="/interview/config"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-accent text-white font-bold text-xs shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all self-start sm:self-auto"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Practice Weak Areas</span>
        </Link>
      </div>

      {/* AI Recommendations from Latest Session */}
      {recommendations.length > 0 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-500/30 bg-brand-950/10 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-brand-400" />
            <span>AI Evaluator Advice from Recent Sessions</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {recommendations.map((rec, i) => (
              <div key={i} className="p-4 rounded-2xl bg-dark-850/80 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-200 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Structured Curriculum Track */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" />
          <span>Recommended Learning Tracks</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {curriculumModules.map((mod, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-brand-400">
                    {mod.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-dark-800 border border-slate-700 text-[10px] text-slate-300 font-mono">
                    {mod.status}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white mb-2">{mod.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{mod.description}</p>

                <div className="space-y-1.5">
                  {mod.topics.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <Link
                  to="/interview/config"
                  state={{
                    interviewType: mod.category.includes('Behavioral') ? 'Behavioral' :
                                   mod.category.includes('Communication') ? 'Mixed' : 'Technical',
                    targetRole: `${mod.title} Specialist`
                  }}
                  className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  <span>Drill This Concept</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


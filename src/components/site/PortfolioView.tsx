/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useLanguage } from '../../lib/i18n/LanguageContext';
import { repository } from '../../lib/repositories';
import { Project } from '../../types';
import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Layers, Cpu, Code, BookOpen, BarChart3, ShieldCheck, Terminal } from 'lucide-react';

interface PortfolioViewProps {
  onNavigate: (path: string) => void;
  selectedSlug?: string;
}

export default function PortfolioView({ onNavigate, selectedSlug }: PortfolioViewProps) {
  const { t, lang } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      const list = await repository.getProjects();
      setProjects(list);
      if (selectedSlug) {
        const match = list.find(p => p.slug === selectedSlug);
        if (match) setSelectedProject(match);
      } else {
        setSelectedProject(null);
      }
    };
    load();
  }, [selectedSlug]);

  const categories = Array.from(new Set(projects.map(p => p.category))) as string[];

  const filteredProjects = projects.filter(p => {
    if (p.status === 'archived') return false;
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    return true;
  });

  const handleProjectClick = (slug: string) => {
    onNavigate(`/portfolio/${slug}`);
  };

  const handleBackToList = () => {
    onNavigate('/portfolio');
  };

  // 1. DETAIL VIEW CASE STUDY
  if (selectedProject) {
    return (
      <div className="w-full bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-200 min-h-screen relative">
        
        {/* Detail Header Banner */}
        <header className="relative border-b border-[var(--border)] px-6 py-8 sm:px-8 bg-[var(--bg-elevated)] overflow-hidden">
          <div className="ambient-glow" />
          <div className="grid-bg" />
          
          <div className="mx-auto max-w-5xl flex flex-col gap-4 relative z-10">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
            >
              <ArrowLeft size={13} />
              <span>{t.common.back}</span>
            </button>
            
            <div className="space-y-2 mt-2">
              <span className="text-[10px] font-mono tracking-widest font-bold text-[var(--accent)] uppercase bg-[var(--accent)]/10 px-2 py-0.5 border border-[var(--accent)]/20 rounded inline-block">
                {selectedProject.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
                {lang === 'zh' ? selectedProject.titleZh : selectedProject.titleEn}
              </h1>
            </div>
          </div>
        </header>

        {/* Detail Content Area */}
        <main className="mx-auto max-w-5xl px-6 sm:px-8 py-10 grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
          
          {/* Main Case Study Text Body */}
          <section className="md:col-span-8 space-y-8 bg-[var(--bg-elevated)] p-6 sm:p-8 border border-[var(--border)] rounded-sm glass-card">
            
            {/* Overview */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest border-b border-[var(--border)] pb-1.5 flex items-center gap-2 text-[var(--text-primary)]">
                <BookOpen size={13} className="text-[var(--accent)]" />
                <span>{t.portfolio.overview}</span>
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {lang === 'zh' ? selectedProject.longDescriptionZh : selectedProject.longDescriptionEn}
              </p>
            </div>

            {/* Problem & Solution dual card row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-dashed border-[var(--border)] pt-6">
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-red-500">
                  {t.portfolio.problem}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {lang === 'zh' ? selectedProject.problemZh : selectedProject.problemEn}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-green-500">
                  {t.portfolio.solution}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {lang === 'zh' ? selectedProject.solutionZh : selectedProject.solutionEn}
                </p>
              </div>
            </div>

            {/* Key Features */}
            <div className="space-y-3 border-t border-dashed border-[var(--border)] pt-6">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest border-b border-[var(--border)] pb-1.5 flex items-center gap-2 text-[var(--text-primary)]">
                <Layers size={13} className="text-[var(--accent)]" />
                <span>{t.portfolio.keyFeatures}</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[var(--text-secondary)]">
                {(lang === 'zh' ? selectedProject.featuresZh : selectedProject.featuresEn)?.map((feat, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-[var(--accent)] font-bold font-mono">[{idx+1}]</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Results */}
            <div className="space-y-3 border-t border-dashed border-[var(--border)] pt-6">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest border-b border-[var(--border)] pb-1.5 flex items-center gap-2 text-[var(--text-primary)]">
                <BarChart3 size={13} className="text-[var(--accent)]" />
                <span>{t.portfolio.results}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[var(--border-subtle)] p-4 border border-[var(--border)] rounded">
                  <span className="block text-[10px] font-mono text-[var(--text-primary)] uppercase font-bold">Performance Delta</span>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1">
                    {lang === 'zh' ? selectedProject.resultZh : selectedProject.resultEn}
                  </p>
                </div>
                <div className="bg-[var(--border-subtle)] p-4 border border-[var(--border)] rounded flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase font-bold">System Verification</span>
                  <div className="flex items-center gap-1.5 text-xs text-green-500 font-mono font-bold mt-2">
                    <ShieldCheck size={14} />
                    <span>PRODUCTION_STABLE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* High-fidelity responsive preview placeholder */}
            <div className="space-y-3 border-t border-dashed border-[var(--border)] pt-6">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest border-b border-[var(--border)] pb-1.5 text-[var(--text-primary)]">
                {t.portfolio.screens}
              </h3>
              <div className="border border-[var(--border)] h-60 w-full bg-[var(--border-subtle)] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden rounded">
                {/* Simulated Grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20" />
                <Terminal size={32} className="text-[var(--text-secondary)] relative z-10 animate-pulse" />
                <span className="text-xs font-mono font-bold mt-4 text-[var(--text-secondary)] uppercase tracking-widest relative z-10">[ Interactive Staging Canvas Link Available inside Client Room ]</span>
              </div>
            </div>

          </section>

          {/* Sidebar Metadata Card */}
          <aside className="md:col-span-4 space-y-6">
            <div className="bg-[var(--bg-elevated)] p-6 border border-[var(--border)] rounded-sm space-y-4 glass-card">
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest border-b border-[var(--border)] pb-1.5 text-[var(--text-primary)]">
                Technical Specifications
              </h4>
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <span className="text-[var(--text-secondary)] block uppercase text-[10px]">Development Segment</span>
                  <span className="font-bold text-[var(--text-primary)] uppercase mt-1 block">{selectedProject.category}</span>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)] block uppercase text-[10px]">{t.portfolio.techStack}</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedProject.techStack.map((tech) => (
                      <span key={tech} className="text-[10px] font-mono bg-[var(--border-subtle)] text-[var(--text-secondary)] px-2 py-0.5 border border-[var(--border)]">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)] block uppercase text-[10px]">Delivery Status</span>
                  <span className="text-green-500 font-bold block mt-1 uppercase">● deployed_active</span>
                </div>
              </div>

              <div className="border-t border-dashed border-[var(--border)] pt-4 mt-2">
                <button
                  onClick={() => onNavigate('/start')}
                  className="w-full py-2.5 bg-[var(--accent)] hover:opacity-95 text-white font-mono text-xs font-bold uppercase tracking-widest transition-opacity flex items-center justify-center gap-1.5 rounded-sm shadow"
                >
                  <span>{t.nav.startProject}</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </aside>

        </main>

      </div>
    );
  }

  // 2. MAIN PROJECTS LIST SHOWCASE
  return (
    <div className="w-full bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-200 min-h-screen relative">
      
      {/* Header Banner */}
      <header className="relative border-b border-[var(--border)] px-6 py-12 md:py-16 sm:px-8 bg-[var(--bg-elevated)] overflow-hidden">
        <div className="ambient-glow" />
        <div className="grid-bg" />
        
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-xs tracking-widest uppercase font-mono font-bold text-[var(--text-secondary)] mb-2">Technical Laboratory</h1>
            <h2 className="text-4xl font-sans font-extrabold tracking-tight text-[var(--text-primary)]">{t.portfolio.title}</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-2 font-mono">{t.portfolio.subtitle}</p>
          </div>
          <button
            onClick={() => onNavigate('/start')}
            className="px-5 py-2.5 bg-[var(--accent)] hover:opacity-95 text-white text-xs font-mono font-bold uppercase tracking-widest self-start md:self-end rounded-sm shadow"
          >
            {t.nav.startProject}
          </button>
        </div>
      </header>

      {/* Category filter bar */}
      <section className="mx-auto max-w-7xl px-6 md:px-8 pt-8 relative z-10">
        <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold tracking-wider transition-all border ${
              selectedCategory === 'all' 
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] border-transparent'
            }`}
          >
            [ALL] {t.portfolio.all}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold tracking-wider transition-all border ${
                selectedCategory === cat 
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)]' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] border-transparent'
              }`}
            >
              [{cat.toUpperCase()}]
            </button>
          ))}
        </div>
      </section>

      {/* Projects Grid */}
      <main className="mx-auto max-w-7xl px-6 md:px-8 py-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div 
              key={project.id}
              onClick={() => handleProjectClick(project.slug)}
              className="group cursor-pointer border border-[var(--border)] rounded-sm bg-[var(--bg-elevated)] overflow-hidden hover:border-[var(--accent)]/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between interactive-card"
            >
              <div>
                {/* Cover visual segment */}
                <div className={`h-36 relative p-4 flex items-end overflow-hidden border-b border-[var(--border)] ${
                  project.coverStyle === 'purple-glow' ? 'bg-gradient-to-br from-indigo-950 to-neutral-900' :
                  project.coverStyle === 'emerald-grid' ? 'bg-gradient-to-br from-zinc-900 to-neutral-950' :
                  project.coverStyle === 'blue-nodes' ? 'bg-gradient-to-br from-blue-950/40 to-neutral-900' :
                  project.coverStyle === 'titanium-metal' ? 'bg-gradient-to-br from-stone-900 to-stone-950' :
                  'bg-gradient-to-br from-neutral-900 to-zinc-950'
                }`}>
                  <span className="text-[9px] font-mono tracking-widest font-bold uppercase text-white/60 bg-white/10 px-2 py-0.5 rounded border border-white/10">
                    {project.category}
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] font-mono uppercase group-hover:text-[var(--accent)] transition-colors">
                    {lang === 'zh' ? project.titleZh : project.titleEn}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                    {lang === 'zh' ? project.descriptionZh : project.descriptionEn}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="text-[9px] font-mono bg-[var(--border-subtle)] text-[var(--text-secondary)] px-2 py-0.5 border border-[var(--border)]">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono font-bold tracking-wider uppercase pt-2 border-t border-[var(--border)]">
                  <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">Read Case Study</span>
                  <span className="text-[var(--text-primary)] group-hover:translate-x-1.5 transition-transform">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useLanguage } from '../../lib/i18n/LanguageContext';
import { repository } from '../../lib/repositories';
import { Project, Service } from '../../types';
import { 
  ArrowRight, 
  Cpu, 
  TrendingUp, 
  Globe, 
  Sliders, 
  Activity, 
  CheckCircle2, 
  Zap,
  Terminal,
  FileText,
  CreditCard,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface HomeViewProps {
  onNavigate: (path: string) => void;
  siteSettings: any;
}

export default function HomeView({ onNavigate, siteSettings }: HomeViewProps) {
  const { t, lang } = useLanguage();
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<'quote' | 'contract' | 'payment'>('quote');

  useEffect(() => {
    const load = async () => {
      const allProjects = await repository.getProjects();
      const featuredP = allProjects.filter(p => p.isFeatured).slice(0, 3);
      setFeaturedProjects(featuredP.length ? featuredP : allProjects.slice(0, 3));

      const allServices = await repository.getServices();
      const featuredS = allServices.filter(s => s.isFeatured).slice(0, 3);
      setFeaturedServices(featuredS.length ? featuredS : allServices.slice(0, 3));
    };
    load();
  }, []);

  const capabilities = [
    {
      icon: <TrendingUp className="text-purple-600 dark:text-purple-400" size={20} />,
      title: t.home.cap1Title,
      desc: t.home.cap1Desc,
      tag: 'FINANCE / TRADING'
    },
    {
      icon: <Cpu className="text-amber-600 dark:text-amber-400" size={20} />,
      title: t.home.cap2Title,
      desc: t.home.cap2Desc,
      tag: 'KNOWLEDGE SYSTEMS'
    },
    {
      icon: <Activity className="text-blue-600 dark:text-blue-400" size={20} />,
      title: t.home.cap3Title,
      desc: t.home.cap3Desc,
      tag: 'AUTOMATION & INFRA'
    }
  ];

  const steps = [
    { num: '01', title: t.home.step1, desc: t.home.step1Desc },
    { num: '02', title: t.home.step2, desc: t.home.step2Desc },
    { num: '03', title: t.home.step3, desc: t.home.step3Desc },
    { num: '04', title: t.home.step4, desc: t.home.step4Desc },
    { num: '05', title: t.home.step5, desc: t.home.step5Desc },
    { num: '06', title: t.home.step6, desc: t.home.step6Desc },
    { num: '07', title: t.home.step7, desc: t.home.step7Desc }
  ];

  return (
    <div className="w-full bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-200 relative">
      
      {/* Hero Section */}
      <section className="relative border-b border-[var(--border)] px-6 py-16 md:py-24 sm:px-8 bg-[var(--bg-elevated)] overflow-hidden">
        
        {/* Ambient Glow & Subtle grid background */}
        <div className="ambient-glow" />
        <div className="grid-bg" />

        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--border)] bg-[var(--border-subtle)] rounded-full text-[10px] font-mono tracking-widest uppercase font-bold text-[var(--text-secondary)]">
              <Zap size={10} className="text-[var(--accent)] animate-pulse" />
              <span>SaaS Studio Operating System Active</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight leading-tight text-[var(--text-primary)]">
              {t.home.heroTitle}
            </h1>
            
            <h2 className="text-lg sm:text-xl font-sans font-medium text-[var(--text-secondary)]">
              {lang === 'zh' ? siteSettings.taglineZh : siteSettings.taglineEn}
            </h2>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
              {t.home.heroDesc}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => onNavigate('/start')}
                className="px-6 py-3 bg-[var(--accent)] text-white hover:opacity-95 text-xs font-bold uppercase tracking-widest transition-all rounded-sm flex items-center gap-2 group shadow hover:-translate-y-0.5"
                id="hero-start-cta"
              >
                <span>{t.home.startProjectCta}</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => onNavigate('/portfolio')}
                className="px-6 py-3 border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--border-subtle)] text-xs font-mono font-bold uppercase tracking-widest transition-all rounded-sm hover:-translate-y-0.5"
                id="hero-viewwork-cta"
              >
                {t.home.viewWorkCta}
              </button>

              <a
                href={siteSettings.officialLineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-[var(--border)] hover:border-[#06C755] hover:bg-[#06C755]/5 text-[var(--text-primary)] text-xs font-mono font-bold uppercase tracking-widest transition-all rounded-sm flex items-center gap-2 hover:-translate-y-0.5"
                id="hero-line-cta"
              >
                <span>{t.home.lineCta}</span>
              </a>
            </div>
          </div>

          {/* Right Visual Floating Panels Column */}
          <div className="lg:col-span-5 relative">
            <div className="border border-[var(--border)] rounded-sm bg-[var(--bg-elevated)]/80 backdrop-blur-md p-5 shadow-sm space-y-4 glass-card">
              <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
                <span className="text-[10px] font-mono tracking-wider font-semibold text-[var(--text-secondary)] uppercase">Live Operations OS</span>
                <span className="text-[10px] bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] font-mono px-2 py-0.5 rounded font-bold uppercase">Online</span>
              </div>

              {/* Dynamic Tabs */}
              <div className="grid grid-cols-3 gap-1 bg-[var(--border-subtle)] p-0.5 rounded border border-[var(--border)]">
                <button
                  onClick={() => setActiveTab('quote')}
                  className={`py-1.5 text-[10px] font-mono font-bold uppercase rounded transition-all ${
                    activeTab === 'quote' ? 'bg-[var(--bg)] text-[var(--text-primary)] border border-[var(--border)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Quote
                </button>
                <button
                  onClick={() => setActiveTab('contract')}
                  className={`py-1.5 text-[10px] font-mono font-bold uppercase rounded transition-all ${
                    activeTab === 'contract' ? 'bg-[var(--bg)] text-[var(--text-primary)] border border-[var(--border)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Contract
                </button>
                <button
                  onClick={() => setActiveTab('payment')}
                  className={`py-1.5 text-[10px] font-mono font-bold uppercase rounded transition-all ${
                    activeTab === 'payment' ? 'bg-[var(--bg)] text-[var(--text-primary)] border border-[var(--border)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Payment
                </button>
              </div>

              {/* Tab Content */}
              <div className="min-h-[140px] flex flex-col justify-between py-2">
                {activeTab === 'quote' && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--text-secondary)] font-mono">EST_NUMBER:</span>
                      <span className="font-mono font-bold text-[var(--text-primary)]">Q-20260012</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--text-secondary)] font-mono">PROJECT:</span>
                      <span className="font-bold text-[var(--text-primary)]">CME GEX Dashboard Integration</span>
                    </div>
                    <div className="border-t border-dashed border-[var(--border)] my-2"></div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--text-secondary)] font-mono">Base Solution:</span>
                      <span className="font-mono text-[var(--text-primary)]">NT$ 88,000</span>
                    </div>
                    <div className="flex justify-between text-xs text-[var(--accent)] font-semibold">
                      <span className="font-mono">Premium Add-ons:</span>
                      <span className="font-mono">+ NT$ 12,000</span>
                    </div>
                  </div>
                )}

                {activeTab === 'contract' && (
                  <div className="space-y-2 animate-in fade-in duration-200 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)] font-mono">PARTY_A:</span>
                      <span className="font-mono font-bold text-[var(--text-primary)]">Kelvin Trading Ltd</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)] font-mono">WARRANTY:</span>
                      <span className="text-[var(--text-primary)]">12 Months Core support</span>
                    </div>
                    <div className="border-t border-dashed border-[var(--border)] my-2"></div>
                    <div className="bg-[var(--border-subtle)] p-2 rounded text-[10px] italic leading-relaxed text-[var(--text-secondary)] border border-[var(--border)]">
                      "Intellectual property and source code transfer fully to Party A upon complete payment settlement."
                    </div>
                  </div>
                )}

                {activeTab === 'payment' && (
                  <div className="space-y-2 animate-in fade-in duration-200 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)] font-mono">PROCESSOR:</span>
                      <span className="font-mono text-[var(--text-primary)] flex items-center gap-1">
                        <CreditCard size={11} className="text-[var(--accent)]" /> Stripe Card Secure
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)] font-mono">CAPTURE_DUE:</span>
                      <span className="text-red-500 font-mono font-bold">TWD 50,000 (50% Deposit)</span>
                    </div>
                    <div className="border-t border-dashed border-[var(--border)] my-2"></div>
                    <div className="flex justify-between text-xs font-bold text-green-600">
                      <span className="font-mono uppercase">Ledger status</span>
                      <span className="font-mono bg-green-100 dark:bg-green-950/30 px-1.5 py-0.5 rounded uppercase">Paid ✓</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Interaction CTA */}
              <button 
                onClick={() => onNavigate('/start')}
                className="w-full py-2 bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg)] font-mono text-[10px] font-bold tracking-widest uppercase transition-opacity"
              >
                Access Client Room [TOKEN]
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Core Capabilities Section */}
      <section className="px-6 py-16 md:py-20 sm:px-8 border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="text-[10px] font-mono font-bold uppercase tracking-widest border-b border-[var(--text-primary)] pb-2 mb-4 inline-block">
              {t.home.capabilitiesTitle}
            </h2>
            <h3 className="text-3xl font-sans font-extrabold tracking-tight text-[var(--text-primary)]">
              {t.home.capabilitiesSub}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[var(--border)] divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
            {capabilities.map((cap, idx) => (
              <div key={idx} className="p-8 space-y-4 hover:bg-[var(--bg-elevated)] transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded border border-[var(--border)] bg-[var(--bg-elevated)]">
                    {cap.icon}
                  </div>
                  <span className="text-[9px] font-mono tracking-widest font-bold text-[var(--text-secondary)]">{cap.tag}</span>
                </div>
                <h4 className="text-md font-sans font-bold tracking-tight text-[var(--text-primary)]">
                  {cap.title}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {cap.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Showcase */}
      <section className="px-6 py-16 md:py-20 sm:px-8 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <h2 className="text-[10px] font-mono font-bold uppercase tracking-widest border-b border-[var(--text-primary)] pb-2 mb-4 inline-block">
                {t.home.featuredTitle}
              </h2>
              <h3 className="text-3xl font-sans font-extrabold tracking-tight text-[var(--text-primary)]">
                {t.home.featuredSub}
              </h3>
            </div>
            <button
              onClick={() => onNavigate('/portfolio')}
              className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--accent)] hover:underline mt-4 sm:mt-0"
            >
              {t.home.viewWorkCta} →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <div 
                key={project.id}
                onClick={() => onNavigate(`/portfolio/${project.slug}`)}
                className="group cursor-pointer border border-[var(--border)] rounded-sm bg-[var(--bg-elevated)] overflow-hidden shadow-sm hover:border-[var(--accent)]/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between interactive-card"
              >
                <div>
                  <div className={`h-36 relative flex items-end overflow-hidden border-b border-[var(--border)] ${
                    project.coverImageUrl ? 'bg-black' :
                    project.coverStyle === 'purple-glow' ? 'bg-gradient-to-br from-indigo-950 to-neutral-900' :
                    project.coverStyle === 'emerald-grid' ? 'bg-gradient-to-br from-zinc-900 to-neutral-950' :
                    project.coverStyle === 'blue-nodes' ? 'bg-gradient-to-br from-blue-950/40 to-neutral-900' :
                    project.coverStyle === 'titanium-metal' ? 'bg-gradient-to-br from-stone-900 to-stone-950' :
                    'bg-gradient-to-br from-neutral-900 to-zinc-950'
                  }`}>
                    {project.coverImageUrl && <img src={project.coverImageUrl} alt={project.titleZh} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="relative z-10 m-4 text-[9px] font-mono tracking-widest font-bold uppercase text-white/80 bg-black/35 px-2 py-0.5 rounded backdrop-blur-sm">
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
                    {project.techStack.slice(0, 3).map((tech) => (
                      <span key={tech} className="text-[9px] font-mono bg-[var(--border-subtle)] text-[var(--text-secondary)] px-2 py-0.5 border border-[var(--border)]">
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 3 && (
                      <span className="text-[9px] font-mono text-[var(--text-secondary)]">+{project.techStack.length - 3}</span>
                    )}
                  </div>
                  {project.projectUrl && <a href={project.projectUrl} target={project.openInNewTab === false ? '_self' : '_blank'} rel="noreferrer" onClick={(event) => event.stopPropagation()} className="flex items-center justify-between border-t border-[var(--border)] pt-3 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]"><span>{lang === 'zh' ? project.ctaLabelZh || '瀏覽專案' : project.ctaLabelEn || 'View project'}</span><ExternalLink size={12} /></a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Process Stepper */}
      <section className="px-6 py-16 md:py-20 sm:px-8 border-b border-[var(--border)] bg-[var(--border-subtle)]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="text-[10px] font-mono font-bold uppercase tracking-widest border-b border-[var(--text-primary)] pb-2 mb-4 inline-block">
              {t.home.processTitle}
            </h2>
            <h3 className="text-3xl font-sans font-extrabold tracking-tight text-[var(--text-primary)]">
              {t.home.processSub}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="relative p-5 border border-[var(--border)] bg-[var(--bg-elevated)] rounded-sm space-y-3 flex flex-col justify-between interactive-card">
                <div>
                  <span className="block font-mono text-base font-bold text-[var(--text-primary)] border-b border-dashed border-[var(--border)] pb-1.5 mb-2">
                    {step.num}
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    {step.title}
                  </h4>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed pt-2">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="px-6 py-16 md:py-24 sm:px-8 bg-[var(--bg)] text-center relative overflow-hidden border-b border-[var(--border)]">
        <div className="absolute inset-0 bg-radial-gradient from-[var(--accent-glow)] to-transparent pointer-events-none opacity-50" />
        
        <div className="mx-auto max-w-3xl space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
            {t.home.ctaTitle}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto">
            {t.home.ctaDesc}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={() => onNavigate('/start')}
              className="px-8 py-3.5 bg-[var(--accent)] hover:opacity-95 text-white font-mono text-xs font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2 shadow hover:-translate-y-0.5"
            >
              <span>{t.home.startProjectCta}</span>
              <ArrowRight size={13} />
            </button>
            <a
              href={siteSettings.officialLineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 border border-[var(--border)] hover:border-[#06C755] hover:bg-[#06C755]/5 text-[var(--text-primary)] font-mono text-xs font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              {t.common.lineCta}
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}

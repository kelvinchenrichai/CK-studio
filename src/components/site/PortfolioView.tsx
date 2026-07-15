import { useEffect, useState } from 'react';
import {
  ArrowLeft, ArrowRight, BarChart3, BookOpen, ExternalLink, Layers, ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { repository } from '../../lib/repositories';
import { Project } from '../../types';

interface PortfolioViewProps {
  onNavigate: (path: string) => void;
  selectedSlug?: string;
}

function ProjectVisual({ project, className = '' }: { project: Project; className?: string }) {
  if (project.coverImageUrl) {
    return <img src={project.coverImageUrl} alt={project.titleZh} className={`h-full w-full object-cover ${className}`} loading="lazy" />;
  }
  return (
    <div className={`grid-bg flex h-full w-full items-center justify-center bg-[var(--border-subtle)] ${className}`}>
      <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-[var(--text-secondary)]">{project.coverStyle}</span>
    </div>
  );
}

export default function PortfolioView({ onNavigate, selectedSlug }: PortfolioViewProps) {
  const { t, lang } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const load = async () => {
      const list = (await repository.getProjects())
        .filter((project) => project.status === 'active')
        .sort((a, b) => a.sortOrder - b.sortOrder);
      setProjects(list);
      setSelectedProject(selectedSlug ? list.find((project) => project.slug === selectedSlug) ?? null : null);
    };
    void load();
  }, [selectedSlug]);

  const categories = Array.from(new Set(projects.map((project) => project.category)));
  const filtered = projects.filter((project) => selectedCategory === 'all' || project.category === selectedCategory);

  if (selectedProject) {
    const gallery = selectedProject.galleryImageUrls ?? [];
    const cta = lang === 'zh' ? selectedProject.ctaLabelZh || '瀏覽專案' : selectedProject.ctaLabelEn || 'View project';
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
        <header className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--bg-elevated)] px-6 py-10 sm:px-8">
          <div className="ambient-glow" />
          <div className="grid-bg" />
          <div className="relative z-10 mx-auto max-w-6xl">
            <button onClick={() => onNavigate('/portfolio')} className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent)]"><ArrowLeft size={14} />{t.common.back}</button>
            <div className="mt-6 grid items-end gap-6 lg:grid-cols-[1fr_auto]">
              <div><span className="rounded border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">{selectedProject.category}</span><h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">{lang === 'zh' ? selectedProject.titleZh : selectedProject.titleEn}</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">{lang === 'zh' ? selectedProject.descriptionZh : selectedProject.descriptionEn}</p></div>
              {selectedProject.projectUrl && <a href={selectedProject.projectUrl} target={selectedProject.openInNewTab === false ? '_self' : '_blank'} rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-5 py-3 text-xs font-bold text-white shadow-lg hover:opacity-90">{cta}<ExternalLink size={14} /></a>}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl space-y-8 px-6 py-10 sm:px-8">
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl"><div className="aspect-[16/8]"><ProjectVisual project={selectedProject} /></div></div>

          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <section className="glass-card space-y-8 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-6 sm:p-8">
              <article><h2 className="flex items-center gap-2 border-b border-[var(--border)] pb-3 text-xs font-bold uppercase tracking-widest"><BookOpen size={14} className="text-[var(--accent)]" />{t.portfolio.overview}</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--text-secondary)]">{lang === 'zh' ? selectedProject.longDescriptionZh : selectedProject.longDescriptionEn}</p></article>
              <div className="grid gap-6 border-t border-dashed border-[var(--border)] pt-7 sm:grid-cols-2"><article><h3 className="text-xs font-bold uppercase tracking-wider text-red-400">{t.portfolio.problem}</h3><p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--text-secondary)]">{lang === 'zh' ? selectedProject.problemZh : selectedProject.problemEn}</p></article><article><h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">{t.portfolio.solution}</h3><p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--text-secondary)]">{lang === 'zh' ? selectedProject.solutionZh : selectedProject.solutionEn}</p></article></div>
              <article className="border-t border-dashed border-[var(--border)] pt-7"><h2 className="flex items-center gap-2 border-b border-[var(--border)] pb-3 text-xs font-bold uppercase tracking-widest"><Layers size={14} className="text-[var(--accent)]" />{t.portfolio.keyFeatures}</h2><ul className="mt-4 grid gap-3 sm:grid-cols-2">{(lang === 'zh' ? selectedProject.featuresZh : selectedProject.featuresEn).map((feature, index) => <li key={`${feature}-${index}`} className="flex gap-3 text-sm leading-6 text-[var(--text-secondary)]"><span className="font-mono font-bold text-[var(--accent)]">{String(index + 1).padStart(2, '0')}</span>{feature}</li>)}</ul></article>
              <article className="border-t border-dashed border-[var(--border)] pt-7"><h2 className="flex items-center gap-2 border-b border-[var(--border)] pb-3 text-xs font-bold uppercase tracking-widest"><BarChart3 size={14} className="text-[var(--accent)]" />{t.portfolio.results}</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--text-secondary)]">{lang === 'zh' ? selectedProject.resultZh : selectedProject.resultEn}</p></article>
            </section>

            <aside className="space-y-5"><div className="glass-card rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-5"><h3 className="border-b border-[var(--border)] pb-3 text-xs font-bold uppercase tracking-widest">Technical Stack</h3><div className="mt-4 flex flex-wrap gap-2">{selectedProject.techStack.map((tech) => <span key={tech} className="rounded border border-[var(--border)] bg-[var(--border-subtle)] px-2 py-1 text-[10px] font-bold">{tech}</span>)}</div><div className="mt-5 flex items-center gap-2 text-xs font-bold text-emerald-400"><ShieldCheck size={15} />PRODUCTION_STABLE</div></div>{selectedProject.projectUrl && <a href={selectedProject.projectUrl} target={selectedProject.openInNewTab === false ? '_self' : '_blank'} rel="noreferrer" className="flex w-full items-center justify-between rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-4 text-sm font-bold text-[var(--accent)] hover:bg-[var(--accent)]/15"><span>{cta}</span><ExternalLink size={16} /></a>}</aside>
          </div>

          {gallery.length > 0 && <section><div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-bold">{lang === 'zh' ? '專案畫面' : 'Project gallery'}</h2><p className="mt-1 text-xs text-[var(--text-secondary)]">{gallery.length} images</p></div></div><div className="grid gap-4 md:grid-cols-2">{gallery.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]"><img src={url} alt={`${selectedProject.titleZh} ${index + 1}`} className="aspect-[16/10] w-full object-cover transition duration-300 group-hover:scale-[1.02]" loading="lazy" /></a>)}</div></section>}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] px-6 py-12 text-[var(--text-primary)] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl"><span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--accent)]">Selected Work</span><h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">{lang === 'zh' ? '作品與專案案例' : 'Portfolio and case studies'}</h1><p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">{lang === 'zh' ? '查看 CK Studio 已完成或正在運行的網站、交易工具與 AI 系統。' : 'Explore websites, trading tools, and AI systems built by CK Studio.'}</p></div>
        <div className="mt-8 flex flex-wrap gap-2"><button onClick={() => setSelectedCategory('all')} className={`rounded-full border px-4 py-2 text-xs font-bold ${selectedCategory === 'all' ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--border)]'}`}>{lang === 'zh' ? '全部' : 'All'}</button>{categories.map((category) => <button key={category} onClick={() => setSelectedCategory(category)} className={`rounded-full border px-4 py-2 text-xs font-bold ${selectedCategory === category ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--border)]'}`}>{category}</button>)}</div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((project) => <article key={project.id} className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] transition hover:-translate-y-1 hover:shadow-2xl"><button onClick={() => onNavigate(`/portfolio/${project.slug}`)} className="block w-full text-left"><div className="aspect-[16/10] overflow-hidden"><ProjectVisual project={project} className="transition duration-500 group-hover:scale-[1.03]" /></div><div className="p-5"><span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">{project.category}</span><h2 className="mt-2 text-lg font-bold">{lang === 'zh' ? project.titleZh : project.titleEn}</h2><p className="mt-3 line-clamp-3 text-xs leading-6 text-[var(--text-secondary)]">{lang === 'zh' ? project.descriptionZh : project.descriptionEn}</p><span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[var(--accent)]">{lang === 'zh' ? '查看案例' : 'View case study'}<ArrowRight size={14} className="transition group-hover:translate-x-1" /></span></div></button>{project.projectUrl && <a href={project.projectUrl} target={project.openInNewTab === false ? '_self' : '_blank'} rel="noreferrer" className="flex items-center justify-between border-t border-[var(--border)] px-5 py-3 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent)]"><span>{lang === 'zh' ? project.ctaLabelZh || '瀏覽專案' : project.ctaLabelEn || 'View project'}</span><ExternalLink size={13} /></a>}</article>)}</div>
      </div>
    </div>
  );
}

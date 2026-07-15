/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useLanguage } from '../../lib/i18n/LanguageContext';
import { repository } from '../../lib/repositories';
import { Service, ServiceCategory } from '../../types';
import { useState, useEffect } from 'react';
import { 
  Zap, 
  Sparkles, 
  Lock, 
  HelpCircle, 
  Clock, 
  ArrowRight,
  MessageSquare,
  Calendar,
  Layers,
  LineChart,
  UserPlus,
  Compass
} from 'lucide-react';

interface ServicesViewProps {
  onNavigate: (path: string) => void;
  siteSettings: any;
  onOpenWaitlist: (service: Service) => void;
}

export default function ServicesView({ onNavigate, siteSettings, onOpenWaitlist }: ServicesViewProps) {
  const { t, lang } = useLanguage();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showMatrix, setShowMatrix] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setCategories(await repository.getCategories());
      setServices(await repository.getServices());
    };
    load();
  }, []);

  const filteredServices = services.filter((service) => {
    // Hide private/hidden services in front-end
    if (service.visibility === 'hidden' || service.visibility === 'private' || service.status === 'archived') {
      return false;
    }
    if (selectedCategory !== 'all' && service.categoryId !== selectedCategory) {
      return false;
    }
    return true;
  });

  // MATRIX COMBINATIONS AND CTA DEFINITIONS
  const getServiceCTARule = (status: Service['status'] | 'coming_soon', availability: Service['availability']) => {
    if (status === 'active' && availability === 'available_now') {
      return {
        badgeZh: '可接案 (Available Now)',
        badgeEn: 'Available Now',
        color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
        cta1Zh: '開始專案',
        cta1En: 'Start a Project',
        cta1Action: () => onNavigate('/start'),
        cta2Zh: 'LINE 諮詢',
        cta2En: 'Add LINE',
        cta2Action: () => window.open(siteSettings.officialLineUrl, '_blank')
      };
    }
    if (status === 'active' && availability === 'consultation_required') {
      return {
        badgeZh: '需先諮詢 (Consultation Required)',
        badgeEn: 'Consultation Required',
        color: 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20',
        cta1Zh: 'LINE 諮詢',
        cta1En: 'LINE Chat',
        cta1Action: () => window.open(siteSettings.officialLineUrl, '_blank'),
        cta2Zh: '預約諮詢開會',
        cta2En: 'Book a Call',
        cta2Action: () => window.open(siteSettings.bookingUrl, '_blank')
      };
    }
    if (status === 'coming_soon' || (status as string) === 'coming_soon' || availability === 'waitlist') {
      return {
        badgeZh: '即將推出 (Coming Soon)',
        badgeEn: 'Coming Soon',
        color: 'bg-[var(--border-subtle)] text-[var(--text-secondary)] border-[var(--border)]',
        cta1Zh: '加入等待名單',
        cta1En: 'Join Waitlist',
        cta1Action: (srv: Service) => onOpenWaitlist(srv),
        cta2Zh: 'LINE 諮詢',
        cta2En: 'Add LINE',
        cta2Action: () => window.open(siteSettings.officialLineUrl, '_blank')
      };
    }
    if ((status as string) === 'beta') {
      return {
        badgeZh: '測試開放 (Beta Mode)',
        badgeEn: 'Beta Access',
        color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        cta1Zh: '申請測試資格',
        cta1En: 'Apply for Beta',
        cta1Action: () => onNavigate('/start'),
        cta2Zh: 'LINE 諮詢',
        cta2En: 'Add LINE',
        cta2Action: () => window.open(siteSettings.officialLineUrl, '_blank')
      };
    }
    if ((status as string) === 'internal') {
      return {
        badgeZh: '內部研究 (Research Lab)',
        badgeEn: 'Research Lab',
        color: 'bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-500/20',
        cta1Zh: '查看研究報告',
        cta1En: 'Read Case Study',
        cta1Action: () => onNavigate('/portfolio'),
        cta2Zh: null,
        cta2En: null,
        cta2Action: null
      };
    }
    if ((status as string) === 'paused') {
      return {
        badgeZh: '暫停接案 (Paused)',
        badgeEn: 'Temporarily Paused',
        color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
        cta1Zh: '詢問未來檔期',
        cta1En: 'Inquire Future',
        cta1Action: () => window.open(siteSettings.officialLineUrl, '_blank'),
        cta2Zh: null,
        cta2En: null,
        cta2Action: null
      };
    }
    // Default fallback
    return {
      badgeZh: '需先諮詢',
      badgeEn: 'Consultation Required',
      color: 'bg-[var(--border-subtle)] text-[var(--text-secondary)] border-[var(--border)]',
      cta1Zh: 'LINE 諮詢',
      cta1En: 'LINE Chat',
      cta1Action: () => window.open(siteSettings.officialLineUrl, '_blank'),
      cta2Zh: null,
      cta2En: null,
      cta2Action: null
    };
  };

  return (
    <div className="w-full bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-200 min-h-screen relative">
      
      {/* Header Banner */}
      <header className="relative border-b border-[var(--border)] px-6 py-12 md:py-16 sm:px-8 bg-[var(--bg-elevated)] overflow-hidden">
        <div className="ambient-glow" />
        <div className="grid-bg" />
        
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-xs tracking-widest uppercase font-mono font-bold text-[var(--text-secondary)] mb-2">Service Catalog CMS</h1>
            <h2 className="text-4xl font-sans font-extrabold tracking-tight text-[var(--text-primary)]">{t.services.title}</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-2 font-mono">{t.services.subtitle}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowMatrix(!showMatrix)}
              className="px-4 py-2 border border-[var(--border)] rounded text-xs font-mono font-bold text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
            >
              {showMatrix ? 'Hide Lifecycle Matrix' : 'Show Lifecycle Matrix'}
            </button>
            <button
              onClick={() => onNavigate('/start')}
              className="px-5 py-2.5 bg-[var(--accent)] text-white text-xs font-mono font-bold uppercase tracking-widest hover:opacity-95 transition-opacity rounded-sm"
            >
              {t.nav.startProject}
            </button>
          </div>
        </div>
      </header>

      {/* Service Availability Matrix Table Visualizer */}
      {showMatrix && (
        <section className="mx-auto max-w-7xl px-6 md:px-8 pt-8 animate-in fade-in duration-200">
          <div className="border border-[var(--border)] bg-[var(--bg-elevated)] p-6 rounded-sm glass-card">
            <div className="flex items-center gap-2 mb-4 border-b border-[var(--border)] pb-2">
              <Compass size={14} className="text-[var(--accent)]" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] font-mono">Service State CTA Lifecycle Matrix (Unsimplified)</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[10px] md:text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] font-mono">
                    <th className="py-2.5 font-bold uppercase tracking-wider">Status Branch</th>
                    <th className="py-2.5 font-bold uppercase tracking-wider">Availability Branch</th>
                    <th className="py-2.5 font-bold uppercase tracking-wider">Resulting CTA Pattern</th>
                    <th className="py-2.5 font-bold uppercase tracking-wider">Target Public Flow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-mono text-[var(--text-secondary)]">
                  <tr>
                    <td className="py-2 text-green-500 font-bold">active</td>
                    <td className="py-2 text-green-500 font-bold">available_now</td>
                    <td className="py-2 text-[var(--text-primary)] font-bold">[Start a Project] & [LINE OA]</td>
                    <td className="py-2 text-[var(--text-secondary)]/70">Direct booking & Quotation request</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-[var(--accent)] font-bold">active</td>
                    <td className="py-2 text-[var(--accent)] font-bold">consultation_required</td>
                    <td className="py-2 text-[var(--text-primary)] font-bold">[LINE OA] & [Book Discovery Call]</td>
                    <td className="py-2 text-[var(--text-secondary)]/70">Discovery Alignment Required</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-amber-500 font-bold">coming_soon</td>
                    <td className="py-2 text-amber-500 font-bold">waitlist</td>
                    <td className="py-2 text-[var(--text-primary)] font-bold">[Join Waitlist Intake Form] & [LINE]</td>
                    <td className="py-2 text-[var(--text-secondary)]/70">Pre-launch Queue Intake</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-purple-500 font-bold">beta</td>
                    <td className="py-2 text-purple-500">any</td>
                    <td className="py-2 text-[var(--text-primary)] font-bold">[Apply for Beta] & [LINE]</td>
                    <td className="py-2 text-[var(--text-secondary)]/70">Restricted Beta Applications</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-stone-500">internal</td>
                    <td className="py-2 text-stone-500">any</td>
                    <td className="py-2 text-[var(--text-primary)] font-bold">[Read Case Study Report]</td>
                    <td className="py-2 text-[var(--text-secondary)]/70">R&D Lab Preview Only</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-red-500">paused</td>
                    <td className="py-2 text-red-500">any</td>
                    <td className="py-2 text-[var(--text-primary)] font-bold">[Inquire Future Availability]</td>
                    <td className="py-2 text-[var(--text-secondary)]/70">Temporary Pipeline Halt</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Main Categories Sidebar + Services Grid */}
      <main className="mx-auto max-w-7xl px-6 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Categories Sidebar */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="sticky top-28 space-y-4 bg-[var(--bg-elevated)] p-5 border border-[var(--border)] glass-card rounded-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-[var(--border)] pb-2 text-[var(--text-primary)] font-mono">
              Filter Categories
            </h3>
            
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`text-left px-3 py-2 text-xs font-mono font-bold transition-all rounded-sm ${
                  selectedCategory === 'all' 
                    ? 'bg-[var(--accent)] text-white border border-[var(--accent)] shadow' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
                }`}
              >
                [ALL] {t.services.filterAll}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-left px-3 py-2 text-xs font-mono font-bold transition-all truncate rounded-sm ${
                    selectedCategory === cat.id 
                      ? 'bg-[var(--accent)] text-white border border-[var(--accent)] shadow' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
                  }`}
                >
                  [{cat.id.toUpperCase()}] {lang === 'zh' ? cat.nameZh : cat.nameEn}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Services Listings Grid */}
        <section className="lg:col-span-9 space-y-12">
          {filteredServices.length === 0 ? (
            <div className="border border-dashed border-[var(--border)] rounded-sm p-12 text-center text-[var(--text-secondary)] font-mono text-xs">
              {t.common.empty}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredServices.map((service) => {
                const ctaRule = getServiceCTARule(service.status, service.availability);
                return (
                  <div 
                    key={service.id}
                    className="border border-[var(--border)] rounded-sm bg-[var(--bg-elevated)] p-6 hover:border-[var(--accent)]/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between interactive-card"
                  >
                    <div className="space-y-4">
                      {/* State badge */}
                      <div className="flex justify-between items-start border-b border-[var(--border)] pb-3">
                        <span className="text-[10px] font-mono tracking-wider text-[var(--text-secondary)] font-bold uppercase">
                          {service.categoryId}
                        </span>
                        
                        <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${ctaRule.color}`}>
                          {lang === 'zh' ? ctaRule.badgeZh : ctaRule.badgeEn}
                        </span>
                      </div>

                      <h4 className="text-md font-sans font-bold tracking-tight text-[var(--text-primary)]">
                        {lang === 'zh' ? service.titleZh : service.titleEn}
                      </h4>

                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed min-h-[50px]">
                        {lang === 'zh' ? service.shortDescriptionZh : service.shortDescriptionEn}
                      </p>

                      {/* Display Pricing if permitted */}
                      {service.showPrice && service.basePrice > 0 ? (
                        <div className="pt-2 font-mono">
                          <span className="text-[var(--text-secondary)] text-[10px] uppercase block tracking-wider font-semibold">Solution Cost</span>
                          <span className="text-[var(--text-primary)] font-bold text-lg">
                            NT$ {service.basePrice.toLocaleString()}
                          </span>
                          <span className="text-xs text-[var(--text-secondary)] font-bold block">
                            {service.billingType === 'starting_from' ? t.services.startingFrom : ''}
                          </span>
                        </div>
                      ) : (
                        <div className="pt-2 font-mono">
                          <span className="text-[var(--text-secondary)] text-[10px] uppercase block tracking-wider font-semibold">Solution Cost</span>
                          <span className="text-[var(--text-secondary)] font-bold text-xs uppercase block pt-1">
                            {t.services.customQuote}
                          </span>
                        </div>
                      )}

                      {/* Service Spec Details */}
                      <div className="space-y-1.5 border-t border-dashed border-[var(--border)] pt-3 text-[11px] font-mono text-[var(--text-secondary)]">
                        {service.requiresMeeting && (
                          <div className="flex items-center gap-1">
                            <Clock size={11} className="text-[var(--text-secondary)]" />
                            <span>{t.services.requiresMeeting}</span>
                          </div>
                        )}
                        {service.requiresContract && (
                          <div className="flex items-center gap-1">
                            <Lock size={11} className="text-[var(--text-secondary)]" />
                            <span>{t.services.requiresContract}</span>
                          </div>
                        )}
                        {service.requiresRemoteAccess && (
                          <div className="flex items-center gap-1">
                            <Layers size={11} className="text-[var(--text-secondary)]" />
                            <span className="text-red-500 dark:text-red-400 font-semibold">{t.services.requiresRemoteAccess}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Interactive CTAs */}
                    <div className="grid grid-cols-1 gap-2 pt-6">
                      {ctaRule.cta1Zh && (
                        <button
                          onClick={() => {
                            ctaRule.cta1Action(service);
                          }}
                          className="w-full py-2 bg-[var(--accent)] text-white hover:opacity-95 font-mono text-xs font-bold uppercase tracking-widest transition-opacity text-center flex items-center justify-center gap-1.5 rounded-sm shadow"
                        >
                          <span>{lang === 'zh' ? ctaRule.cta1Zh : ctaRule.cta1En}</span>
                          <ArrowRight size={11} />
                        </button>
                      )}

                      {ctaRule.cta2Zh && (
                        <button
                          onClick={ctaRule.cta2Action}
                          className="w-full py-2 border border-[var(--border)] hover:border-[#06C755] hover:bg-[#06C755]/5 text-[var(--text-primary)] font-mono text-xs font-bold uppercase tracking-widest transition-all text-center flex items-center justify-center gap-1.5 rounded-sm"
                        >
                          <span>{lang === 'zh' ? ctaRule.cta2Zh : ctaRule.cta2En}</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useLanguage } from '../../lib/i18n/LanguageContext';
import { repository } from '../../lib/repositories';
import { PricingPlan, AddOn } from '../../types';
import { useState, useEffect } from 'react';
import { Check, Info, Plus, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';

interface PricingViewProps {
  onNavigate: (path: string, state?: any) => void;
}

export default function PricingView({ onNavigate }: PricingViewProps) {
  const { t, lang } = useLanguage();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [addons, setAddons] = useState<AddOn[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('plan-business');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const allPlans = await repository.getPricingPlans();
      setPlans(allPlans.filter(p => p.visibility === 'public' && p.status === 'active'));
      const allAddons = await repository.getAddOns();
      setAddons(allAddons.filter(a => a.status === 'active'));
    };
    load();
  }, []);

  const handleAddonToggle = (id: string) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Live calculator calculation
  const getCalculatedTotal = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return 0;
    let sum = plan.basePrice;
    
    selectedAddons.forEach(addonId => {
      const addon = addons.find(a => a.id === addonId);
      if (addon) sum += addon.price;
    });

    return sum;
  };

  const currentPlan = plans.find(p => p.id === selectedPlan) || plans[0];

  const handleProceedToStart = () => {
    onNavigate('/start', {
      preselectedPlanId: selectedPlan,
      preselectedAddonIds: selectedAddons
    });
  };

  return (
    <div className="w-full bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-200 min-h-screen relative">
      
      {/* Header Banner */}
      <header className="relative border-b border-[var(--border)] px-6 py-12 md:py-16 sm:px-8 bg-[var(--bg-elevated)] overflow-hidden">
        <div className="ambient-glow" />
        <div className="grid-bg" />
        
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-xs tracking-widest uppercase font-mono font-bold text-[var(--text-secondary)] mb-2">Flexible Scope Blueprints</h1>
            <h2 className="text-4xl font-sans font-extrabold tracking-tight text-[var(--text-primary)]">{t.pricing.title}</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-2 font-mono">{t.pricing.subtitle}</p>
          </div>
          <button
            onClick={() => onNavigate('/start')}
            className="px-5 py-2.5 bg-[var(--accent)] hover:opacity-95 text-white text-xs font-mono font-bold uppercase tracking-widest self-start md:self-end rounded-sm shadow"
          >
            {t.nav.startProject}
          </button>
        </div>
      </header>

      {/* Main Grid: Plan templates (L) & Interactive Live Simulator (R) */}
      <main className="mx-auto max-w-7xl px-6 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Side: Dynamic base plans list */}
        <section className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`border rounded-sm bg-[var(--bg-elevated)] p-6 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between relative interactive-card ${
                    isSelected 
                      ? 'border-[var(--accent)] ring-1 ring-[var(--accent)] scale-[1.02]' 
                      : 'border-[var(--border)]'
                  }`}
                >
                  {plan.isRecommended && (
                    <span className="absolute -top-3 right-4 bg-[var(--accent)] text-white text-[8px] font-mono font-black tracking-widest uppercase px-2 py-1 rounded shadow-sm">
                      {t.pricing.recommmended}
                    </span>
                  )}

                  <div className="space-y-4">
                    <div className="border-b border-[var(--border)] pb-3">
                      <span className="text-[10px] font-mono tracking-wider text-[var(--text-secondary)] uppercase">Baseline Template</span>
                      <h4 className="text-sm font-bold text-[var(--text-primary)] font-mono uppercase mt-1">
                        {lang === 'zh' ? plan.nameZh : plan.nameEn}
                      </h4>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed min-h-[50px]">
                      {lang === 'zh' ? plan.descriptionZh : plan.descriptionEn}
                    </p>

                    <div className="py-2 font-mono">
                      <span className="text-[var(--text-primary)] font-black text-2xl">
                        NT$ {plan.basePrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-[var(--text-secondary)] font-bold block">{t.services.startingFrom}</span>
                    </div>

                    <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                      {(lang === 'zh' ? plan.featuresZh : plan.featuresEn).map((feat, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <Check size={12} className="text-[var(--accent)] mt-0.5 shrink-0" />
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-dashed border-[var(--border)] pt-4 mt-6">
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[var(--text-secondary)] uppercase">
                      <div>
                        <span>{t.pricing.depositLabel}</span>
                        <span className="block text-[var(--text-primary)] font-bold">{plan.depositPercent}%</span>
                      </div>
                      <div>
                        <span>{t.pricing.deliveryDays}</span>
                        <span className="block text-[var(--text-primary)] font-bold">{plan.estimatedDeliveryDays} days</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add-ons List checklists */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] p-6 rounded-sm glass-card">
            <div className="border-b border-[var(--border)] pb-3 mb-6">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--text-primary)]">
                {t.pricing.addonsTitle}
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-mono mt-1">{t.pricing.addonsSubtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addons.map((addon) => {
                const isChecked = selectedAddons.includes(addon.id);
                return (
                  <div 
                    key={addon.id}
                    onClick={() => handleAddonToggle(addon.id)}
                    className={`border p-4 rounded-sm transition-all duration-200 cursor-pointer flex items-start gap-4 select-none ${
                      isChecked 
                        ? 'border-[var(--accent)] bg-[var(--border-subtle)]' 
                        : 'border-[var(--border)] hover:bg-[var(--border-subtle)]'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={isChecked}
                      onChange={() => {}} // toggled on container click
                      className="mt-1 h-3.5 w-3.5 accent-[var(--accent)] rounded cursor-pointer"
                    />
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-[var(--text-primary)] font-mono uppercase">
                          {lang === 'zh' ? addon.nameZh : addon.nameEn}
                        </h4>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        {lang === 'zh' ? addon.descriptionZh : addon.descriptionEn}
                      </p>
                      <div className="font-mono text-xs font-black text-[var(--text-primary)] pt-1">
                        + NT$ {addon.price.toLocaleString()} {addon.unit === 'page' ? `/ ${t.pricing.perPage}` : addon.unit === 'month' ? `/ ${t.pricing.perMonth}` : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right Side: Interactive Real-time Calculator & Scope Generator */}
        <aside className="lg:col-span-4">
          <div className="sticky top-28 bg-[var(--bg-elevated)] border border-[var(--border)] p-6 rounded-sm space-y-6 glass-card">
            <div className="border-b border-[var(--border)] pb-3">
              <span className="text-[9px] font-mono tracking-widest font-black text-[var(--accent)] uppercase">Live Scope Estimator</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] font-mono mt-1">CK OS Estimator Matrix</h3>
            </div>

            {/* Scope Summary logs */}
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between border-b border-dashed border-[var(--border)] pb-1.5">
                <span className="text-[var(--text-secondary)]">BASE_PLAN:</span>
                <span className="font-bold text-[var(--text-primary)] truncate max-w-[150px]">
                  {currentPlan ? (lang === 'zh' ? currentPlan.nameZh : currentPlan.nameEn) : 'None'}
                </span>
              </div>
              
              <div className="flex justify-between border-b border-dashed border-[var(--border)] pb-1.5">
                <span className="text-[var(--text-secondary)]">PLAN_COST:</span>
                <span className="font-bold text-[var(--text-primary)]">
                  NT$ {currentPlan?.basePrice.toLocaleString()}
                </span>
              </div>

              {selectedAddons.length > 0 && (
                <div className="space-y-1.5 pt-1.5">
                  <span className="text-[var(--text-secondary)] block text-[10px] uppercase">SELECTED_ADDONS:</span>
                  {selectedAddons.map(addonId => {
                    const add = addons.find(a => a.id === addonId);
                    if (!add) return null;
                    return (
                      <div key={addonId} className="flex justify-between text-[11px] pl-2 text-[var(--accent)]">
                        <span className="truncate max-w-[150px]">- {lang === 'zh' ? add.nameZh : add.nameEn}</span>
                        <span>+ NT$ {add.price.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="border-t border-[var(--border)] pt-4 mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">TOTAL_ESTIMATE:</span>
                  <span className="font-black text-[var(--text-primary)] text-lg">
                    NT$ {getCalculatedTotal().toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between text-[11px]">
                  <span className="text-[var(--text-secondary)] uppercase">REVISIONS:</span>
                  <span className="font-bold text-[var(--text-primary)]">{currentPlan?.revisionCount || 0} guaranteed</span>
                </div>

                <div className="flex justify-between text-[11px]">
                  <span className="text-[var(--text-secondary)] uppercase">TIMELINE:</span>
                  <span className="font-bold text-[var(--text-primary)]">~{currentPlan?.estimatedDeliveryDays || 0} working days</span>
                </div>
              </div>
            </div>

            {/* Launch Workspace CTA */}
            <div className="pt-2">
              <button
                onClick={handleProceedToStart}
                className="w-full py-3 bg-[var(--accent)] hover:opacity-95 text-white font-mono text-xs font-bold uppercase tracking-widest transition-opacity flex items-center justify-center gap-2 rounded-sm shadow"
              >
                <span>{t.home.startProjectCta}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </aside>

      </main>

    </div>
  );
}

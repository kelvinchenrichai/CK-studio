/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useLanguage } from '../../lib/i18n/LanguageContext';
import { repository } from '../../lib/repositories';
import { Inquiry } from '../../types';
import React, { useState, useEffect } from 'react';
import { MessageSquare, Phone, Calendar, ArrowRight, CheckCircle2, ClipboardList, Info } from 'lucide-react';

interface StartProjectViewProps {
  siteSettings: any;
  navigationState?: {
    preselectedPlanId?: string;
    preselectedAddonIds?: string[];
  };
}

export default function StartProjectView({ siteSettings, navigationState }: StartProjectViewProps) {
  const { t, lang } = useLanguage();
  const [success, setSuccess] = useState<boolean>(false);
  
  // Form fields state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [taxId, setTaxId] = useState('');
  const [industry, setIndustry] = useState('Trading');
  const [projectType, setProjectType] = useState('TradingView Indicator');
  const [budget, setBudget] = useState('30,000 - 60,000');
  const [timeline, setTimeline] = useState('1 - 2 weeks');
  const [desc, setDesc] = useState('');
  const [refs, setRefs] = useState('');
  const [needMeeting, setNeedMeeting] = useState<boolean>(true);
  const [contactPref, setContactPref] = useState<'LINE' | 'Email' | 'Phone'>('LINE');
  const [langPref, setLangPref] = useState<'zh' | 'en'>(lang);
  const [invoice, setInvoice] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      if (navigationState?.preselectedPlanId) {
        const plans = await repository.getPricingPlans();
        const plan = plans.find(p => p.id === navigationState.preselectedPlanId);
        if (plan) {
          setProjectType(lang === 'zh' ? plan.nameZh : plan.nameEn);
          setBudget(`TWD ${plan.basePrice.toLocaleString()} - ${(plan.basePrice * 1.5).toLocaleString()}`);
          let addMsg = `Interested in preselected blueprint: ${plan.nameEn}.\n`;
          if (navigationState.preselectedAddonIds?.length) {
            const addons = await repository.getAddOns();
            addMsg += `Preselected Add-ons:\n`;
            navigationState.preselectedAddonIds.forEach(id => {
              const add = addons.find(a => a.id === id);
              if (add) addMsg += `- ${add.nameEn} (NT$ ${add.price.toLocaleString()})\n`;
            });
          }
          setDesc(addMsg);
        }
      }
    };
    load();
  }, [navigationState, lang]);

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      alert(lang === 'zh' ? '請填寫必填欄位：姓名、Email 與聯絡電話' : 'Please fill in required fields: Name, Email and Phone');
      return;
    }

    repository.createInquiry({
      name,
      email,
      phone,
      lineId: contactPref === 'LINE' ? phone : '',
      company,
      taxId,
      industry,
      projectType,
      budgetRange: budget,
      timeline,
      message: desc,
      needMeeting,
      preferredContactMethod: contactPref,
      languagePreference: langPref,
      invoiceRequirement: invoice,
      status: 'new',
      selectedPlanId: navigationState?.preselectedPlanId,
      selectedServiceIds: navigationState?.preselectedAddonIds
    });

    setSuccess(true);
    // Scroll to success panel top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-200 min-h-screen relative">
      
      {/* Header Banner */}
      <header className="relative border-b border-[var(--border)] px-6 py-12 md:py-16 sm:px-8 bg-[var(--bg-elevated)] overflow-hidden">
        <div className="ambient-glow" />
        <div className="grid-bg" />
        
        <div className="mx-auto max-w-7xl relative z-10">
          <h1 className="text-xs tracking-widest uppercase font-mono font-bold text-[var(--text-secondary)] mb-2">Technical Engagement Intake</h1>
          <h2 className="text-4xl font-sans font-extrabold tracking-tight text-[var(--text-primary)]">{t.start.title}</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-2 font-mono">{t.start.subtitle}</p>
        </div>
      </header>

      {/* Main Grid Options */}
      <main className="mx-auto max-w-7xl px-6 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Side: Option Panels (LINE, Schedulers) */}
        <section className="lg:col-span-5 space-y-6">
          
          {/* Option 1: Official LINE */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[#06C755]/30 p-6 rounded-sm space-y-4 glass-card interactive-card">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[#06C755] text-white">
                <MessageSquare size={16} />
              </div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--text-primary)]">
                {t.start.option1Title}
              </h3>
            </div>
            
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {t.start.option1Desc}
            </p>

            <a
              href={siteSettings.officialLineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full py-2.5 bg-[#06C755] hover:opacity-90 text-white font-mono text-xs font-bold uppercase tracking-widest text-center items-center justify-center gap-1.5 rounded-sm shadow-sm transition-all"
              id="start-line-btn"
            >
              <span>{t.start.option1Btn}</span>
              <ArrowRight size={13} />
            </a>
          </div>

          {/* Option 3: Book Discovery Call */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] p-6 rounded-sm space-y-4 glass-card interactive-card">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[var(--text-primary)] text-[var(--bg)] border border-[var(--border)]">
                <Calendar size={16} />
              </div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--text-primary)]">
                {t.start.option3Title}
              </h3>
            </div>
            
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {t.start.option3Desc}
            </p>

            <a
              href={siteSettings.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full py-2.5 border border-[var(--border)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] font-mono text-xs font-bold uppercase tracking-widest text-center items-center justify-center gap-1.5 rounded-sm transition-all"
              id="start-booking-btn"
            >
              <span>{t.start.option3Btn}</span>
              <ArrowRight size={13} />
            </a>
          </div>

        </section>

        {/* Right Side: High-fidelity Inquiry Submission Form */}
        <section className="lg:col-span-7">
          {success ? (
            <div className="bg-[var(--bg-elevated)] border border-green-500 p-8 text-center rounded-sm space-y-4 animate-in fade-in duration-200 glass-card" id="success-inquiry-panel">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-md font-bold text-[var(--text-primary)] font-mono uppercase">
                {t.common.success}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                {t.common.inquirySuccess}
              </p>
              <div className="pt-4">
                <a
                  href={siteSettings.officialLineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex px-6 py-2 bg-[#06C755] text-white font-mono text-xs font-bold uppercase tracking-widest items-center gap-1.5 rounded-sm shadow-sm hover:opacity-90 transition-opacity"
                >
                  <span>{t.common.lineCta}</span>
                  <ArrowRight size={12} />
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitForm} className="bg-[var(--bg-elevated)] border border-[var(--border)] p-6 sm:p-8 rounded-sm space-y-6 glass-card" id="form-project-inquiry">
              
              <div className="border-b border-[var(--border)] pb-3 flex items-center gap-2">
                <ClipboardList size={15} className="text-[var(--accent)]" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--text-primary)]">
                  {t.start.option2Title}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Contact Name */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-[var(--text-secondary)] font-bold">
                    {t.start.formName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full text-xs font-mono bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] px-3.5 py-2.5 rounded-sm focus:border-[var(--accent)] focus:outline-none focus:ring-0 transition-all shadow-sm"
                    id="input-form-name"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-[var(--text-secondary)] font-bold">
                    {t.start.formEmail} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full text-xs font-mono bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] px-3.5 py-2.5 rounded-sm focus:border-[var(--accent)] focus:outline-none focus:ring-0 transition-all shadow-sm"
                    id="input-form-email"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-[var(--text-secondary)] font-bold">
                    {t.start.formPhone} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+886 912 345 678 / LINE ID"
                    className="w-full text-xs font-mono bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] px-3.5 py-2.5 rounded-sm focus:border-[var(--accent)] focus:outline-none focus:ring-0 transition-all shadow-sm"
                    id="input-form-phone"
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-[var(--text-secondary)]">
                    {t.start.formCompany}
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full text-xs font-mono bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] px-3.5 py-2.5 rounded-sm focus:border-[var(--accent)] focus:outline-none focus:ring-0 transition-all shadow-sm"
                  />
                </div>

                {/* Unified Tax ID */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-[var(--text-secondary)]">
                    {t.start.formTaxId}
                  </label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="8-digit Tax ID"
                    className="w-full text-xs font-mono bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] px-3.5 py-2.5 rounded-sm focus:border-[var(--accent)] focus:outline-none focus:ring-0 transition-all shadow-sm"
                  />
                </div>

                {/* Industry Sector */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-[var(--text-secondary)]">
                    {t.start.formIndustry}
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full text-xs font-mono bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] px-3.5 py-2.5 rounded-sm focus:border-[var(--accent)] focus:outline-none focus:ring-0 transition-all shadow-sm"
                  >
                    <option value="Trading">Trading & Quant Solutions</option>
                    <option value="Content Creator">Digital Content & Media</option>
                    <option value="E-Commerce">E-Commerce & Retail</option>
                    <option value="Business Automation">Enterprise Business Systems</option>
                    <option value="Other">Other Category</option>
                  </select>
                </div>

                {/* Project Type */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-[var(--text-secondary)]">
                    {t.start.formProjectType}
                  </label>
                  <input
                    type="text"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    placeholder="TradingView Indicator / AI Auto n8n"
                    className="w-full text-xs font-mono bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] px-3.5 py-2.5 rounded-sm focus:border-[var(--accent)] focus:outline-none focus:ring-0 transition-all shadow-sm"
                  />
                </div>

                {/* Budget Range */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-[var(--text-secondary)]">
                    {t.start.formBudget}
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full text-xs font-mono bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] px-3.5 py-2.5 rounded-sm focus:border-[var(--accent)] focus:outline-none focus:ring-0 transition-all shadow-sm"
                  >
                    <option value="Under 15,000">Under NT$ 15,000</option>
                    <option value="15,000 - 30,000">NT$ 15,000 - NT$ 30,000</option>
                    <option value="30,000 - 60,000">NT$ 30,000 - NT$ 60,000</option>
                    <option value="60,000 - 150,000">NT$ 60,000 - NT$ 150,000</option>
                    <option value="Above 150,000">Above NT$ 150,000 (Enterprise)</option>
                  </select>
                </div>

                {/* Hope Timeline */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-[var(--text-secondary)]">
                    {t.start.formTimeline}
                  </label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full text-xs font-mono bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] px-3.5 py-2.5 rounded-sm focus:border-[var(--accent)] focus:outline-none focus:ring-0 transition-all shadow-sm"
                  >
                    <option value="1 - 2 weeks">1 - 2 Weeks (Standard)</option>
                    <option value="2 - 4 weeks">2 - 4 Weeks</option>
                    <option value="Above 1 month">1 Month +</option>
                    <option value="Urgent">Extremely Urgent (Emergency)</option>
                  </select>
                </div>

                {/* Preference contact method */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-[var(--text-secondary)] font-bold">
                    {t.start.formContactPref}
                  </label>
                  <select
                    value={contactPref}
                    onChange={(e) => setContactPref(e.target.value as any)}
                    className="w-full text-xs font-mono bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] px-3.5 py-2.5 rounded-sm focus:border-[var(--accent)] focus:outline-none focus:ring-0 transition-all shadow-sm"
                  >
                    <option value="LINE">LINE (Fastest response)</option>
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                  </select>
                </div>

              </div>

              {/* Specifications Area */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase text-[var(--text-secondary)] font-bold">
                  {t.start.formDesc}
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Detail out indicator logic, API targets, n8n sync rules, etc."
                  rows={4}
                  className="w-full text-xs font-mono bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] p-3.5 rounded-sm focus:border-[var(--accent)] focus:outline-none focus:ring-0 transition-all shadow-sm"
                />
              </div>

              {/* Reference Sites */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase text-[var(--text-secondary)]">
                  {t.start.formRefs}
                </label>
                <textarea
                  value={refs}
                  onChange={(e) => setRefs(e.target.value)}
                  placeholder="https://example1.com&#10;https://example2.com"
                  rows={2}
                  className="w-full text-xs font-mono bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] p-3.5 rounded-sm focus:border-[var(--accent)] focus:outline-none focus:ring-0 transition-all shadow-sm"
                />
              </div>

              {/* Inline switches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="switch-meeting"
                    checked={needMeeting}
                    onChange={(e) => setNeedMeeting(e.target.checked)}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                  <label htmlFor="switch-meeting" className="text-xs font-mono font-bold text-[var(--text-secondary)] select-none">
                    {t.start.formMeeting}
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="switch-invoice"
                    checked={invoice}
                    onChange={(e) => setInvoice(e.target.checked)}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                  <label htmlFor="switch-invoice" className="text-xs font-mono font-bold text-[var(--text-secondary)] select-none">
                    {t.start.formInvoice}
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="border-t border-[var(--border)] pt-6">
                <button
                  type="submit"
                  className="w-full py-3 bg-[var(--accent)] hover:opacity-95 text-white font-mono text-xs font-bold uppercase tracking-widest transition-opacity flex items-center justify-center gap-2 rounded-sm shadow-sm"
                  id="btn-submit-inquiry"
                >
                  <span>{t.start.submitBtn}</span>
                  <ArrowRight size={13} />
                </button>
              </div>

            </form>
          )}
        </section>

      </main>

    </div>
  );
}

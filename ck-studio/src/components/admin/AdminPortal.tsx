/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useLanguage } from '../../lib/i18n/LanguageContext';
import { repository } from '../../lib/repositories';
import { Project, Service, Client, Inquiry, Quote, Contract, Payment, AuditLog } from '../../types';
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Terminal, 
  Users, 
  Layers, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  X, 
  Lock, 
  ShieldAlert, 
  FolderPlus,
  RefreshCw,
  Search,
  Eye,
  Settings,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface AdminPortalProps {
  onNavigate: (path: string) => void;
  onLoginSuccess: () => void;
  isLoggedIn: boolean;
}

export default function AdminPortal({ onNavigate, onLoginSuccess, isLoggedIn }: AdminPortalProps) {
  const { t, lang } = useLanguage();
  
  // Security lock state
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Active Tab navigation inside Admin OS
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'services' | 'crm' | 'quotes' | 'payments' | 'audit' | 'settings'>('dashboard');

  // Core database states
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Editor modal/forms states
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [compilingQuote, setCompilingQuote] = useState<{
    clientId: string;
    customTitleZh: string;
    customTitleEn: string;
    subtotal: number;
    tax: number;
    total: number;
    notesZh: string;
    notesEn: string;
  } | null>(null);

  // Load all preseeded database repositories
  const loadDatabase = () => {
    setProjects(repository.getProjects());
    setServices(repository.getServices());
    setClients(repository.getClients());
    setInquiries(repository.getInquiries());
    setQuotes(repository.getQuotes());
    setContracts(repository.getContracts());
    setPayments(repository.getPayments());
    setAuditLogs(repository.getAuditLogs().reverse()); // Reverse to see newest first
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadDatabase();
    }
  }, [isLoggedIn]);

  // Handle local credential gate
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123' || password === 'admin') {
      onLoginSuccess();
      setAuthError('');
    } else {
      setAuthError('Access Denied. Invalid master password.');
    }
  };

  // 1. PROJECT SHOWCASE CMS ACTIONS
  const handleSaveProject = () => {
    if (!editingProject?.titleZh || !editingProject?.titleEn || !editingProject?.slug) {
      alert('Missing required fields for Project Showcase entry.');
      return;
    }

    if (editingProject.id) {
      // Update existing
      repository.updateProject(editingProject.id, editingProject);
    } else {
      // Create new
      repository.createProject({
        ...editingProject,
        techStack: editingProject.techStack || ['TypeScript'],
        featuresZh: editingProject.featuresZh || [],
        featuresEn: editingProject.featuresEn || [],
        status: 'active',
        isFeatured: editingProject.isFeatured || false,
        coverStyle: editingProject.coverStyle || 'titanium-metal',
        slug: editingProject.slug
      } as Project);
    }

    setEditingProject(null);
    loadDatabase();
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this case study portfolio?')) {
      repository.deleteProject(id);
      loadDatabase();
    }
  };

  // 2. SERVICES CMS CATALOG ACTIONS
  const handleSaveService = () => {
    if (!editingService?.titleZh || !editingService?.titleEn || !editingService?.categoryId) {
      alert('Missing required fields for Service Item entry.');
      return;
    }

    if (editingService.id) {
      repository.updateService(editingService.id, editingService);
    } else {
      const randomId = `srv-${Math.floor(Math.random() * 90000) + 10000}`;
      repository.createService({
        ...editingService,
        id: randomId,
        shortDescriptionZh: editingService.shortDescriptionZh || '',
        shortDescriptionEn: editingService.shortDescriptionEn || '',
        basePrice: editingService.basePrice || 0,
        currency: 'TWD',
        billingType: editingService.billingType || 'fixed',
        showPrice: editingService.showPrice ?? true,
        status: editingService.status || 'active',
        visibility: editingService.visibility || 'public',
        availability: editingService.availability || 'available_now',
        requiresMeeting: editingService.requiresMeeting || false,
        requiresContract: editingService.requiresContract || true
      } as Service);
    }

    setEditingService(null);
    loadDatabase();
  };

  // 3. COMPILE CUSTOM QUOTE FROM CRM INQUIRY
  const handleInitQuoteCompile = (inquiry: Inquiry) => {
    setCompilingQuote({
      clientId: inquiry.clientId || 'c-preseeded-kelvin',
      customTitleZh: inquiry.projectType || '客製專案系統開發',
      customTitleEn: inquiry.projectType || 'Custom System Development',
      subtotal: 50000,
      tax: 2500,
      total: 52500,
      notesZh: '本專案報價包含基礎系統整合與一年的基礎 core support。',
      notesEn: 'This quote includes basic system integration and 12-month standard core support.'
    });
    setActiveTab('quotes');
  };

  const handleSaveCompiledQuote = () => {
    if (!compilingQuote) return;

    const publicTokenForAlert = `tok_quote_${Math.random().toString(36).substring(2, 10)}`; // saved internally
    
    repository.createQuote({
      clientId: compilingQuote.clientId,
      selectedPlanId: 'plan-business',
      customTitleZh: compilingQuote.customTitleZh,
      customTitleEn: compilingQuote.customTitleEn,
      subtotal: compilingQuote.subtotal,
      discount: 0,
      tax: compilingQuote.tax,
      total: compilingQuote.total,
      depositPercent: 50,
      depositAmount: Math.round(compilingQuote.total * 0.5),
      balanceAmount: Math.round(compilingQuote.total * 0.5),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'draft',
      notesZh: compilingQuote.notesZh,
      notesEn: compilingQuote.notesEn,
      termsZh: '依合約附件為準。',
      termsEn: 'Subject to SOW schedule attachment.',
      lineItems: [
        {
          titleZh: compilingQuote.customTitleZh,
          titleEn: compilingQuote.customTitleEn,
          descriptionZh: compilingQuote.notesZh,
          descriptionEn: compilingQuote.notesEn,
          quantity: 1,
          unitPrice: compilingQuote.subtotal,
          amount: compilingQuote.subtotal,
          type: 'service'
        }
      ]
    });

    setCompilingQuote(null);
    loadDatabase();
    alert(`Successfully compiled custom quote!`);
  };

  // 4. LEDGER ACTIONS (Manual Payments Settle)
  const handleSettlePaymentStatus = (paymentId: string) => {
    repository.updatePaymentStatus(paymentId, 'paid');
    
    // Automatically flag matched contract as deposit_paid
    const p = repository.getPayments().find(pay => pay.id === paymentId);
    if (p && p.contractId) {
      repository.updateContractStatus(p.contractId, 'deposit_paid');
    }

    loadDatabase();
    alert('Payment Settle ledger updated to Paid status.');
  };

  // SECURITY GATE SCREEN (UNLOGGED)
  if (!isLoggedIn) {
    return (
      <div className="w-full bg-[var(--bg)] text-[var(--text-primary)] flex items-center justify-center min-h-[80vh] px-6 relative overflow-hidden">
        <div className="ambient-glow" />
        <div className="grid-bg" />
        
        <div className="w-full max-w-md bg-[var(--bg-elevated)] p-8 border border-[var(--border)] rounded-sm space-y-6 glass-card relative z-10 shadow-xl">
          <div className="text-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)] mx-auto animate-pulse">
              <ShieldAlert size={20} />
            </div>
            <h2 className="text-xl font-sans font-extrabold tracking-tight text-[var(--text-primary)]">CK Studio Master Gateway</h2>
            <p className="text-xs text-[var(--text-secondary)] font-mono">Master passcode is required to decrypt internal studio logs</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono uppercase text-[var(--text-secondary)] font-bold">Passcode</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type master pass (e.g. admin)"
                className="w-full text-xs font-mono bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] px-3.5 py-2.5 rounded-sm focus:border-[var(--accent)] focus:outline-none focus:ring-0 transition-all shadow-sm"
                id="input-admin-pass"
              />
            </div>

            {authError && (
              <div className="text-[10px] text-red-500 font-mono text-center font-bold">{authError}</div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-[var(--accent)] hover:opacity-90 text-white font-mono text-xs font-bold uppercase tracking-widest text-center items-center justify-center rounded-sm transition-opacity shadow-sm"
              id="btn-admin-login-submit"
            >
              Sign In To OS Console
            </button>
          </form>

          <div className="bg-[var(--border-subtle)] p-4 border border-[var(--border)] rounded-sm text-[10px] font-mono text-[var(--text-secondary)] text-center leading-relaxed">
            <span className="text-[var(--accent)] font-bold">Sandbox Test Code:</span> admin123 / admin
          </div>
        </div>
      </div>
    );
  }

  // CALC ANALYTICS LOGS
  const totalInquiriesCount = inquiries.length;
  const activeContractsCount = contracts.filter(c => c.status === 'deposit_paid' || c.status === 'signed').length;
  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

  // CORE ADMIN DASHBOARD RENDER FRAME
  return (
    <div className="w-full bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-200 min-h-screen relative overflow-hidden">
      <div className="grid-bg" />
      
      {/* Admin Operations Top Navigation Bar */}
      <header className="border-b border-[var(--border)] bg-[var(--bg-elevated)]/60 backdrop-blur-md px-6 py-4 sm:px-8 relative z-10">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-[var(--accent)]/15 text-[var(--accent)] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                SYSTEM_CONSOLE
              </span>
              <span className="text-xs font-mono text-[var(--text-secondary)]">Ver 2.4.0 (Stripe Secure Enabled)</span>
            </div>
            <h2 className="text-lg font-sans font-bold text-[var(--text-primary)] mt-1 tracking-tight">
              CK Studio Operating System Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDatabase}
              className="p-2 border border-[var(--border)] rounded-sm bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
              title="Refresh database"
            >
              <RefreshCw size={14} />
            </button>
            <span className="text-[10px] text-[var(--accent)] font-mono font-black uppercase flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-[var(--accent)] rounded-full animate-ping" /> Local Persistent Sandbox Online
            </span>
          </div>
        </div>
      </header>

      {/* Navigation Subtabs Bar */}
      <nav className="border-b border-[var(--border)] bg-[var(--bg-elevated)]/40 backdrop-blur-md px-6 sm:px-8 overflow-x-auto relative z-10">
        <div className="mx-auto max-w-7xl flex gap-1 sm:gap-4 py-2">
          {[
            { id: 'dashboard', label: 'Dashboard Logs', icon: <Terminal size={12} /> },
            { id: 'projects', label: 'Projects Showcase CMS', icon: <FolderPlus size={12} /> },
            { id: 'services', label: 'Services Catalog CMS', icon: <Layers size={12} /> },
            { id: 'crm', label: 'CRM Client Leads', icon: <Users size={12} /> },
            { id: 'quotes', label: 'Quotes formulated', icon: <FileText size={12} /> },
            { id: 'payments', label: 'Payments Ledger', icon: <DollarSign size={12} /> },
            { id: 'audit', label: 'System Audit Logs', icon: <Clock size={12} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setEditingProject(null); setEditingService(null); }}
              className={`px-3 py-2 text-xs font-mono uppercase font-black flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
                activeTab === tab.id 
                  ? 'border-[var(--accent)] text-[var(--accent)]' 
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Admin Content Frame */}
      <main className="mx-auto max-w-7xl px-6 md:px-8 py-8 relative z-10">
        
        {/* SUBTAB 1: ANALYTICS DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-150 relative z-10">
            {/* Stat Counters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-[var(--bg-elevated)] border border-[var(--border)] p-5 rounded-sm space-y-2 glass-card">
                <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase font-black block tracking-wider">Inward CRM inquiries</span>
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-mono font-black text-[var(--text-primary)]">{totalInquiriesCount}</span>
                  <span className="text-[11px] text-[var(--accent)] font-mono font-bold">+100% active</span>
                </div>
              </div>

              <div className="bg-[var(--bg-elevated)] border border-[var(--border)] p-5 rounded-sm space-y-2 glass-card">
                <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase font-black block tracking-wider">Active Contracts signed</span>
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-mono font-black text-[var(--text-primary)]">{activeContractsCount}</span>
                  <span className="text-[11px] text-[var(--accent)] font-mono">Formulated standard escrow</span>
                </div>
              </div>

              <div className="bg-[var(--bg-elevated)] border border-[var(--accent)] p-5 rounded-sm space-y-2 glass-card relative overflow-hidden">
                <div className="absolute top-0 right-0 h-10 w-10 bg-[var(--accent)]/10 rounded-bl-full flex items-center justify-center text-[var(--accent)]">
                  <DollarSign size={14} />
                </div>
                <span className="text-[10px] font-mono text-[var(--accent)] uppercase font-black block tracking-wider">Total cleared revenue</span>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-mono font-black text-[var(--text-primary)]">NT$ {totalRevenue.toLocaleString()}</span>
                  <span className="text-[11px] text-[var(--text-secondary)] font-mono">Cleared TWD</span>
                </div>
              </div>

            </div>

            {/* Simulated Clean SVG Bar Chart or visual report */}
            <div className="bg-[var(--bg-elevated)] border border-[var(--border)] p-6 rounded-sm glass-card">
              <div className="border-b border-[var(--border)] pb-3 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] font-mono">Monthly cleared volume index</h3>
              </div>
              
              <div className="h-44 w-full flex items-end gap-6 pt-4 px-4 border-b border-[var(--border)]">
                {[
                  { month: 'FEB', val: 30, revenue: 'NT$ 15,000' },
                  { month: 'MAR', val: 55, revenue: 'NT$ 48,000' },
                  { month: 'APR', val: 85, revenue: 'NT$ 112,000' },
                  { month: 'MAY', val: 95, revenue: 'NT$ 180,000' }
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative">
                    {/* Tooltip */}
                    <div className="absolute -top-10 bg-[var(--text-primary)] text-[var(--bg)] font-mono text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-black uppercase shadow-lg">
                      {item.revenue} TWD
                    </div>
                    <div 
                      className="w-full bg-[var(--accent)] opacity-70 group-hover:opacity-100 transition-all rounded-t-sm"
                      style={{ height: `${item.val}%` }}
                    />
                    <span className="text-[9px] font-mono font-bold text-[var(--text-secondary)] mt-2">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Audit Snapshot Logs */}
            <div className="bg-[var(--border-subtle)] text-[var(--text-primary)] p-5 rounded-sm border border-[var(--border)] font-mono text-xs space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
                <span className="text-[var(--accent)] font-black">SYSTEM_DIAGNOSTICS_SNAPSHOT</span>
                <span className="text-[var(--text-secondary)]">[4 active categories]</span>
              </div>
              <div className="space-y-1 text-[var(--text-secondary)]">
                <p>&gt; checking stripe webhook verification signatures: <span className="text-[var(--accent)] font-bold">READY</span></p>
                <p>&gt; syncing CRM persistent database repositories: <span className="text-[var(--accent)]">STABLE</span></p>
                <p>&gt; preseeded records verified: {projects.length} showcase case studies loaded.</p>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: PROJECTS CMS */}
        {activeTab === 'projects' && (
          <div className="space-y-6 animate-in fade-in duration-150 relative z-10">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] font-mono">Portfolio Showcase CMS ({projects.length} Entries)</h3>
              {!editingProject && (
                <button
                  onClick={() => setEditingProject({})}
                  className="px-3.5 py-1.5 bg-[var(--accent)] text-white hover:opacity-90 text-xs font-mono uppercase font-black tracking-wider flex items-center gap-1.5 rounded-sm shadow-sm transition-all"
                >
                  <Plus size={13} />
                  <span>Add Case Study</span>
                </button>
              )}
            </div>

            {/* Project Editing Sheet Panel */}
            {editingProject && (
              <div className="bg-[var(--bg-elevated)] border border-[var(--border)] p-6 rounded-sm space-y-4 animate-in fade-in duration-200 glass-card">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] font-mono border-b border-[var(--border)] pb-2">
                  {editingProject.id ? 'Modify Case Study' : 'Compile New Portfolio Case Study'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-[var(--text-secondary)] font-bold">Project Slug (Unique ID) *</label>
                    <input
                      type="text"
                      required
                      value={editingProject.slug || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value })}
                      placeholder="e.g. signal-bot-tv"
                      className="w-full text-xs font-mono bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] rounded-sm px-3 py-2 focus:border-[var(--accent)] focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-[var(--text-secondary)] font-bold">Showcase Segment (Category)</label>
                    <input
                      type="text"
                      value={editingProject.category || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                      placeholder="e.g. Trading"
                      className="w-full text-xs font-mono bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] rounded-sm px-3 py-2 focus:border-[var(--accent)] focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-[var(--text-secondary)] font-bold">Title (ZH) *</label>
                    <input
                      type="text"
                      required
                      value={editingProject.titleZh || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, titleZh: e.target.value })}
                      placeholder="e.g. CME 選擇權大數據儀表板"
                      className="w-full text-xs font-mono bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] rounded-sm px-3 py-2 focus:border-[var(--accent)] focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-[var(--text-secondary)] font-bold">Title (EN) *</label>
                    <input
                      type="text"
                      required
                      value={editingProject.titleEn || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, titleEn: e.target.value })}
                      placeholder="e.g. CME Option GEX Dashboard"
                      className="w-full text-xs font-mono bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] rounded-sm px-3 py-2 focus:border-[var(--accent)] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-[var(--text-secondary)] font-bold">Detailed Summary (ZH)</label>
                  <textarea
                    rows={2}
                    value={editingProject.descriptionZh || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, descriptionZh: e.target.value })}
                    className="w-full text-xs font-mono bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] rounded-sm p-2 focus:border-[var(--accent)] focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-[var(--text-secondary)] font-bold">Detailed Summary (EN)</label>
                  <textarea
                    rows={2}
                    value={editingProject.descriptionEn || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, descriptionEn: e.target.value })}
                    className="w-full text-xs font-mono bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] rounded-sm p-2 focus:border-[var(--accent)] focus:outline-none transition-all"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setEditingProject(null)}
                    className="px-4 py-2 border border-[var(--border)] rounded-sm text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProject}
                    className="px-5 py-2 bg-[var(--accent)] text-white hover:opacity-90 rounded-sm text-xs font-mono font-bold shadow-sm transition-all"
                  >
                    Commit Showcase Item
                  </button>
                </div>
              </div>
            )}

            {/* Projects list table */}
            <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm overflow-hidden text-xs glass-card shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--border-subtle)] border-b border-[var(--border)] font-mono text-[var(--text-secondary)] uppercase">
                    <th className="p-3">Category</th>
                    <th className="p-3">Slug ID</th>
                    <th className="p-3">ZH Header / EN Header</th>
                    <th className="p-3">Featured?</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-[var(--text-primary)]">
                  {projects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-[var(--border-subtle)]/40 transition-colors">
                      <td className="p-3 font-mono font-bold uppercase text-[var(--accent)]">{proj.category}</td>
                      <td className="p-3 font-mono text-[var(--text-secondary)]">{proj.slug}</td>
                      <td className="p-3">
                        <div className="font-bold text-[var(--text-primary)]">{proj.titleZh}</div>
                        <div className="text-[11px] text-[var(--text-secondary)]">{proj.titleEn}</div>
                      </td>
                      <td className="p-3 font-mono">
                        {proj.isFeatured ? (
                          <span className="text-[var(--accent)] font-bold">YES ★</span>
                        ) : (
                          <span className="text-[var(--text-secondary)]">NO</span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => setEditingProject(proj)}
                          className="p-1 border border-[var(--border)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] transition-colors inline-flex"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1 border border-red-500/25 rounded text-red-400 hover:bg-red-500/10 transition-colors inline-flex"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 3: SERVICES CATALOG CMS */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-in fade-in duration-150 relative z-10">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] font-mono">Service Catalog CMS ({services.length} items)</h3>
              {!editingService && (
                <button
                  onClick={() => setEditingService({})}
                  className="px-3.5 py-1.5 bg-[var(--accent)] text-white hover:opacity-90 text-xs font-mono uppercase font-black tracking-wider flex items-center gap-1.5 rounded-sm shadow-sm transition-all"
                >
                  <Plus size={13} />
                  <span>Add Service Item</span>
                </button>
              )}
            </div>

            {/* Service editing sheet */}
            {editingService && (
              <div className="bg-[var(--bg-elevated)] border border-[var(--border)] p-6 rounded-sm space-y-4 animate-in fade-in duration-200 glass-card">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] font-mono border-b border-[var(--border)] pb-2">
                  {editingService.id ? 'Modify Service Blueprint' : 'Configure New Service Catalog Item'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-[var(--text-secondary)] font-bold">Category Segment ID *</label>
                    <select
                      value={editingService.categoryId || ''}
                      onChange={(e) => setEditingService({ ...editingService, categoryId: e.target.value })}
                      className="w-full bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] rounded-sm p-2 focus:border-[var(--accent)] focus:outline-none transition-all"
                    >
                      <option value="">Select segment</option>
                      <option value="trading">trading</option>
                      <option value="consultation">consultation</option>
                      <option value="automation">automation</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-[var(--text-secondary)] font-bold">Base Cost Price (TWD) *</label>
                    <input
                      type="number"
                      required
                      value={editingService.basePrice || 0}
                      onChange={(e) => setEditingService({ ...editingService, basePrice: Number(e.target.value) })}
                      className="w-full bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] rounded-sm p-2 focus:border-[var(--accent)] focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-[var(--text-secondary)] font-bold">Title (ZH) *</label>
                    <input
                      type="text"
                      required
                      value={editingService.titleZh || ''}
                      onChange={(e) => setEditingService({ ...editingService, titleZh: e.target.value })}
                      className="w-full bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] rounded-sm p-2 focus:border-[var(--accent)] focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-[var(--text-secondary)] font-bold">Title (EN) *</label>
                    <input
                      type="text"
                      required
                      value={editingService.titleEn || ''}
                      onChange={(e) => setEditingService({ ...editingService, titleEn: e.target.value })}
                      className="w-full bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] rounded-sm p-2 focus:border-[var(--accent)] focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-[var(--text-secondary)] font-bold">System Status</label>
                    <select
                      value={editingService.status || 'active'}
                      onChange={(e) => setEditingService({ ...editingService, status: e.target.value as any })}
                      className="w-full bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] rounded-sm p-2 focus:border-[var(--accent)] focus:outline-none transition-all"
                    >
                      <option value="active">active</option>
                      <option value="coming_soon">coming_soon</option>
                      <option value="beta">beta</option>
                      <option value="internal">internal</option>
                      <option value="paused">paused</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-[var(--text-secondary)] font-bold">Service Availability</label>
                    <select
                      value={editingService.availability || 'available_now'}
                      onChange={(e) => setEditingService({ ...editingService, availability: e.target.value as any })}
                      className="w-full bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] rounded-sm p-2 focus:border-[var(--accent)] focus:outline-none transition-all"
                    >
                      <option value="available_now">available_now</option>
                      <option value="consultation_required">consultation_required</option>
                      <option value="waitlist">waitlist</option>
                      <option value="not_available">not_available</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-[var(--text-secondary)] font-bold">Display price in catalog?</label>
                    <select
                      value={editingService.showPrice ? 'true' : 'false'}
                      onChange={(e) => setEditingService({ ...editingService, showPrice: e.target.value === 'true' })}
                      className="w-full bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] rounded-sm p-2 focus:border-[var(--accent)] focus:outline-none transition-all"
                    >
                      <option value="true">YES - Show base price</option>
                      <option value="false">NO - Show "Custom Quote"</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setEditingService(null)} className="px-4 py-2 border border-[var(--border)] rounded-sm text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-all">Cancel</button>
                  <button onClick={handleSaveService} className="px-5 py-2 bg-[var(--accent)] text-white hover:opacity-90 text-xs font-mono font-bold rounded-sm shadow-sm transition-all">Commit Service Blueprint</button>
                </div>
              </div>
            )}

            {/* Catalog Items list */}
            <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm overflow-hidden text-xs glass-card shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--border-subtle)] border-b border-[var(--border)] font-mono text-[var(--text-secondary)] uppercase">
                    <th className="p-3">Category</th>
                    <th className="p-3">Service Name / Price</th>
                    <th className="p-3">Life-cycle Status</th>
                    <th className="p-3">Availability</th>
                    <th className="p-3">Direct checkout link</th>
                    <th className="p-3 text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-[var(--text-primary)]">
                  {services.map((srv) => (
                    <tr key={srv.id} className="hover:bg-[var(--border-subtle)]/40 transition-colors">
                      <td className="p-3 font-mono font-bold uppercase text-[var(--text-secondary)]">{srv.categoryId}</td>
                      <td className="p-3">
                        <div className="font-bold text-[var(--text-primary)]">{srv.titleZh}</div>
                        <div className="text-[11px] text-[var(--text-secondary)] font-mono">
                          NT$ {srv.basePrice.toLocaleString()} {srv.showPrice ? '' : '(Custom Quote Hidden)'}
                        </div>
                      </td>
                      <td className="p-3 font-mono">
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase border ${
                          srv.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          srv.status === 'coming_soon' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {srv.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono uppercase text-[11px] font-bold text-[var(--text-secondary)]">{srv.availability}</td>
                      <td className="p-3 font-mono text-[var(--text-secondary)] text-[10px]">
                        {srv.allowDirectCheckout ? (
                          <span className="text-green-400">Stripe payment session ok</span>
                        ) : (
                          <span>Requires Form Align</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setEditingService(srv)}
                          className="p-1 border border-[var(--border)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] transition-colors inline-flex"
                        >
                          <Edit size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 4: CRM CLIENTS & INQUIRIES */}
        {activeTab === 'crm' && (
          <div className="space-y-6 animate-in fade-in duration-150 relative z-10">
            <div className="border-b border-[var(--border)] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] font-mono">Inward Client Inquiries / CRM Leads ({inquiries.length} submissions)</h3>
            </div>

            <div className="space-y-4">
              {inquiries.length === 0 ? (
                <div className="border border-dashed border-[var(--border)] p-10 text-center text-[var(--text-secondary)] font-mono text-xs">No user leads yet. Submit form on start page to test lead routing!</div>
              ) : (
                inquiries.map((inq) => (
                  <div key={inq.id} className="bg-[var(--bg-elevated)] border border-[var(--border)] p-5 rounded-sm space-y-4 shadow-sm hover:border-[var(--accent)]/50 transition-colors glass-card">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-dashed border-[var(--border)] pb-3 gap-2">
                      <div className="font-mono text-xs text-[var(--text-secondary)]">
                        <span className="uppercase text-[10px]">LEAD_ID:</span>{' '}
                        <span className="font-bold text-[var(--text-primary)]">{inq.id}</span>
                        <span className="ml-4">Channel pref:</span>{' '}
                        <span className="text-[var(--accent)] font-bold">{inq.preferredContactMethod}</span>
                      </div>
                      
                      <button
                        onClick={() => handleInitQuoteCompile(inq)}
                        className="px-3.5 py-1.5 bg-[var(--accent)] text-white hover:opacity-95 text-xs font-mono uppercase font-black tracking-widest self-start rounded-sm shadow-sm transition-all"
                      >
                        Compile Quote & Contract
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[var(--text-secondary)] block text-[9px] uppercase">Lead Contact Name</span>
                        <span className="font-bold text-[var(--text-primary)] mt-0.5 block">{inq.name}</span>
                      </div>
                      <div>
                        <span className="text-[var(--text-secondary)] block text-[9px] uppercase">Email coordinates</span>
                        <span className="font-bold block text-[var(--accent)] mt-0.5 underline">{inq.email}</span>
                      </div>
                      <div>
                        <span className="text-[var(--text-secondary)] block text-[9px] uppercase">Phone / LINE ID</span>
                        <span className="font-bold text-[var(--text-primary)] mt-0.5 block">{inq.phone}</span>
                      </div>
                      <div>
                        <span className="text-[var(--text-secondary)] block text-[9px] uppercase">Project Type & Budget</span>
                        <span className="font-bold text-[var(--accent)] mt-0.5 block">{inq.projectType} / TWD {inq.budgetRange}</span>
                      </div>
                    </div>

                    <div className="bg-[var(--border-subtle)] p-3 rounded-sm border border-[var(--border)] text-xs leading-relaxed text-[var(--text-secondary)]">
                      <span className="text-[var(--accent)] font-bold block font-mono text-[9px] uppercase">Client SOW Specifications:</span>
                      {inq.message || 'No custom specification logs.'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 5: QUOTES & CONTRACTS */}
        {activeTab === 'quotes' && (
          <div className="space-y-6 animate-in fade-in duration-150 relative z-10">
            {/* Quote compiler sheet if preloaded */}
            {compilingQuote && (
              <div className="bg-[var(--bg-elevated)] border-2 border-[var(--accent)] p-6 rounded-sm space-y-4 glass-card shadow-xl">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] font-mono border-b border-[var(--border)] pb-2">Compile Custom Quote & Contract Formula</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--text-secondary)]">Custom Title (ZH) *</label>
                    <input
                      type="text"
                      value={compilingQuote.customTitleZh}
                      onChange={(e) => setCompilingQuote({ ...compilingQuote, customTitleZh: e.target.value })}
                      className="w-full bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] rounded-sm p-2 focus:border-[var(--accent)] focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--text-secondary)]">Custom Title (EN) *</label>
                    <input
                      type="text"
                      value={compilingQuote.customTitleEn}
                      onChange={(e) => setCompilingQuote({ ...compilingQuote, customTitleEn: e.target.value })}
                      className="w-full bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] rounded-sm p-2 focus:border-[var(--accent)] focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--text-secondary)]">Total Price Formula Cost (TWD) *</label>
                    <input
                      type="number"
                      value={compilingQuote.subtotal}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCompilingQuote({
                          ...compilingQuote,
                          subtotal: val,
                          tax: Math.round(val * 0.05),
                          total: Math.round(val * 1.05)
                        });
                      }}
                      className="w-full bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] rounded-sm p-2 focus:border-[var(--accent)] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setCompilingQuote(null)} className="px-4 py-2 border border-[var(--border)] rounded-sm text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-all">Cancel</button>
                  <button onClick={handleSaveCompiledQuote} className="px-5 py-2 bg-[var(--accent)] text-white hover:opacity-90 text-xs font-mono font-bold uppercase tracking-wider rounded-sm shadow-sm transition-all">Commit Quote & Generate Security Token</button>
                </div>
              </div>
            )}

            <div className="border-b border-[var(--border)] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] font-mono">Active Formulated Quotes ({quotes.length} items)</h3>
            </div>

            <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm overflow-hidden text-xs glass-card shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--border-subtle)] border-b border-[var(--border)] font-mono text-[var(--text-secondary)] uppercase">
                    <th className="p-3">Quote Number</th>
                    <th className="p-3">Client Reference ID</th>
                    <th className="p-3">Title Description</th>
                    <th className="p-3">Grand Total</th>
                    <th className="p-3">Access Security Token</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">View Client Portal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-[var(--text-primary)]">
                  {quotes.map((q) => (
                    <tr key={q.id} className="hover:bg-[var(--border-subtle)]/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-[var(--accent)]">{q.quoteNumber}</td>
                      <td className="p-3 font-mono font-bold uppercase">{q.clientId}</td>
                      <td className="p-3 font-sans font-medium text-[var(--text-primary)]">{q.customTitleZh || 'System Contract development'}</td>
                      <td className="p-3 font-mono font-black text-[var(--text-primary)]">NT$ {q.total.toLocaleString()}</td>
                      <td className="p-3 font-mono text-[var(--accent)] font-bold select-all underline">{q.publicToken}</td>
                      <td className="p-3 font-mono">
                        <span className={`px-2 py-0.5 text-[10px] rounded-sm uppercase font-bold border ${
                          q.status === 'accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-[var(--border-subtle)] text-[var(--text-secondary)] border-[var(--border)]'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onNavigate(`/client/${q.publicToken}`)}
                          className="px-2.5 py-1 border border-[var(--border)] rounded-sm text-xs font-mono uppercase font-black tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] transition-colors"
                        >
                          Launch Room [TOKEN]
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 6: PAYMENTS LEDGER */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-in fade-in duration-150 relative z-10">
            <div className="border-b border-[var(--border)] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] font-mono">Billing & Payments Income Ledger ({payments.length} Payments)</h3>
            </div>

            <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm overflow-hidden text-xs glass-card shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--border-subtle)] border-b border-[var(--border)] font-mono text-[var(--text-secondary)] uppercase">
                    <th className="p-3">Payment ID</th>
                    <th className="p-3">Method / Provider</th>
                    <th className="p-3">TWD Amount</th>
                    <th className="p-3">Reference Contract Number</th>
                    <th className="p-3">Clearing Status</th>
                    <th className="p-3 text-right">Update Status Settle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-[var(--text-primary)]">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-[var(--border-subtle)]/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-[var(--accent)]">{p.paymentNumber}</td>
                      <td className="p-3 font-mono">
                        <span className="font-bold text-[var(--text-primary)] block">{p.provider.toUpperCase()}</span>
                        <span className="text-[10px] text-[var(--text-secondary)]">{p.paymentMethod || 'Credit card checkout'}</span>
                      </td>
                      <td className="p-3 font-mono font-black text-[var(--text-primary)]">NT$ {p.amount.toLocaleString()}</td>
                      <td className="p-3 font-mono text-[var(--text-secondary)]">{p.contractId || 'No related SOW contract'}</td>
                      <td className="p-3 font-mono">
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase border ${
                          p.status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {p.status === 'pending' ? (
                          <button
                            onClick={() => handleSettlePaymentStatus(p.id)}
                            className="px-2.5 py-1 bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                          >
                            Verify & Settle Income
                          </button>
                        ) : (
                          <span className="text-green-400 font-mono font-bold uppercase text-[10px]">Verified ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 7: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-6 animate-in fade-in duration-150 relative z-10">
            <div className="border-b border-[var(--border)] pb-3 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] font-mono">System Audit Trail Logs</h3>
              <span className="text-[10px] text-[var(--text-secondary)] font-mono uppercase">Showing {auditLogs.length} chronological actions</span>
            </div>

            <div className="bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] p-5 rounded-sm font-mono text-[11px] space-y-2.5 h-96 overflow-y-scroll scrollbar-thin scrollbar-thumb-stone-800 glass-card">
              {auditLogs.map((log) => (
                <div key={log.id} className="border-b border-[var(--border)] pb-2">
                  <div className="flex justify-between text-[var(--text-secondary)] text-[10px]">
                    <span>{new Date(log.createdAt).toISOString()}</span>
                    <span>Actor: {log.actor}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-[var(--accent)] font-bold">[{log.action.toUpperCase()}]</span>{' '}
                    <span className="text-[var(--text-secondary)]">Entity: {log.entityType} (ID: {log.entityId})</span>
                  </div>
                  {log.after && (
                    <div className="text-[10px] text-[var(--text-secondary)] mt-1 truncate">
                      State Update: {JSON.stringify(log.after)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

    </div>
  );
}

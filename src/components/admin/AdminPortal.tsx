/**
 * CK Studio 管理後台
 * - 中文介面
 * - Supabase Email/Password 登入
 * - 作品、服務、方案、網站設定完整編輯
 * - 快速上架／下架
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleDollarSign,
  Eye,
  EyeOff,
  FileText,
  FolderKanban,
  Layers3,
  Loader2,
  LockKeyhole,
  LogIn,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { repository, isUsingSupabase } from '../../lib/repositories';
import { supabase } from '../../lib/supabase/client';
import {
  Client,
  Inquiry,
  Payment,
  PricingPlan,
  Project,
  ProjectCoverStyle,
  Quote,
  Service,
  SiteSettings,
} from '../../types';

interface AdminPortalProps {
  onNavigate: (path: string) => void;
  onLoginSuccess: () => void;
  isLoggedIn: boolean;
}

type AdminTab = 'dashboard' | 'projects' | 'services' | 'pricing' | 'crm' | 'quotes' | 'payments' | 'settings';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'kelvinchenrichai@gmail.com';

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  studioName: 'CK Studio',
  taglineZh: '為交易員、創作者與企業打造 AI 驅動的智能軟體系統。',
  taglineEn: 'Building intelligent software for traders, creators, and businesses.',
  email: ADMIN_EMAIL,
  phone: '',
  officialLineUrl: '',
  bookingUrl: '',
  socials: {},
  defaultLanguage: 'zh',
  defaultTheme: 'dark',
  brandColor: '#3B82F6',
};

const nowIso = () => new Date().toISOString();
const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const linesToArray = (value: string) => value.split('\n').map((item) => item.trim()).filter(Boolean);
const arrayToLines = (value?: string[]) => (value ?? []).join('\n');

const EMPTY_PROJECT: Project = {
  id: '',
  slug: '',
  titleZh: '',
  titleEn: '',
  category: '',
  descriptionZh: '',
  descriptionEn: '',
  longDescriptionZh: '',
  longDescriptionEn: '',
  techStack: [],
  featuresZh: [],
  featuresEn: [],
  status: 'active',
  isFeatured: false,
  coverStyle: 'titanium-metal',
  sortOrder: 0,
  problemZh: '',
  problemEn: '',
  solutionZh: '',
  solutionEn: '',
  resultZh: '',
  resultEn: '',
  createdAt: '',
  updatedAt: '',
};

const EMPTY_SERVICE: Service = {
  id: '',
  categoryId: 'consultation',
  titleZh: '',
  titleEn: '',
  shortDescriptionZh: '',
  shortDescriptionEn: '',
  longDescriptionZh: '',
  longDescriptionEn: '',
  deliverablesZh: [],
  deliverablesEn: [],
  requirementsZh: [],
  requirementsEn: [],
  basePrice: 0,
  currency: 'TWD',
  priceLabelZh: '起',
  priceLabelEn: 'starting from',
  billingType: 'starting_from',
  depositPercent: 50,
  estimatedDeliveryDays: 30,
  revisionCount: 2,
  showPrice: true,
  isPublic: true,
  isFeatured: false,
  requiresMeeting: false,
  requiresContract: true,
  requiresRemoteAccess: false,
  requiresClientMaterials: false,
  relatedAddOnIds: [],
  relatedContractTemplateId: '',
  stripePriceId: '',
  stripePaymentLink: '',
  status: 'active',
  visibility: 'public',
  availability: 'available_now',
  showOnHome: true,
  showOnServicesPage: true,
  showOnPricingPage: false,
  showOnStartProjectPage: true,
  showInQuoteBuilder: true,
  showInAdminOnly: false,
  allowDirectCheckout: false,
  allowQuoteRequest: true,
  allowLineConsultation: true,
  allowBooking: true,
  allowWaitlist: false,
  sortOrder: 0,
  createdAt: '',
  updatedAt: '',
};

const EMPTY_PLAN: PricingPlan = {
  id: '',
  nameZh: '',
  nameEn: '',
  descriptionZh: '',
  descriptionEn: '',
  basePrice: 0,
  currency: 'TWD',
  priceLabelZh: '起',
  priceLabelEn: 'starting from',
  billingType: 'one-time',
  depositPercent: 50,
  revisionCount: 2,
  estimatedDeliveryDays: 30,
  featuresZh: [],
  featuresEn: [],
  addOnIds: [],
  isRecommended: false,
  visibility: 'public',
  status: 'active',
  showOnHome: true,
  showOnPricingPage: true,
  showInQuoteBuilder: true,
  isFeatured: false,
  stripePriceId: '',
  stripePaymentLink: '',
  sortOrder: 0,
  createdAt: '',
  updatedAt: '',
};

function Field({ label, children, full = false, hint }: { label: string; children: React.ReactNode; full?: boolean; hint?: string }) {
  return (
    <label className={`space-y-1.5 ${full ? 'md:col-span-2' : ''}`}>
      <span className="block text-xs font-semibold text-[var(--text-secondary)]">{label}</span>
      {children}
      {hint && <span className="block text-[10px] text-[var(--text-secondary)]">{hint}</span>}
    </label>
  );
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (checked: boolean) => void; label: string; description?: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-md border border-[var(--border)] bg-[var(--border-subtle)]/40 px-3 py-2.5 text-left"
    >
      <span>
        <span className="block text-xs font-semibold text-[var(--text-primary)]">{label}</span>
        {description && <span className="block text-[10px] text-[var(--text-secondary)] mt-0.5">{description}</span>}
      </span>
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-[var(--accent)]' : 'bg-gray-500/35'}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </span>
    </button>
  );
}

function StatusBadge({ active, activeText = '已上架', inactiveText = '已下架' }: { active: boolean; activeText?: string; inactiveText?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${active ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-gray-500/30 bg-gray-500/10 text-gray-400'}`}>
      {active ? activeText : inactiveText}
    </span>
  );
}

export default function AdminPortal({ onLoginSuccess, isLoggedIn }: AdminPortalProps) {
  const [email] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);

  const inputClass = 'w-full rounded-md border border-[var(--border)] bg-[var(--border-subtle)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]';
  const textareaClass = `${inputClass} min-h-24 resize-y`;

  const flash = (message: string) => {
    setSaveMessage(message);
    window.setTimeout(() => setSaveMessage(''), 2600);
  };

  const safeLoad = async <T,>(loader: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await loader();
    } catch (error) {
      console.error('[CK Studio Admin] 載入資料失敗', error);
      return fallback;
    }
  };

  const loadDatabase = async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    const [projectData, serviceData, planData, clientData, inquiryData, quoteData, paymentData, settingsData] = await Promise.all([
      safeLoad(() => repository.getProjects(), [] as Project[]),
      safeLoad(() => repository.getServices(), [] as Service[]),
      safeLoad(() => repository.getPricingPlans(), [] as PricingPlan[]),
      safeLoad(() => repository.getClients(), [] as Client[]),
      safeLoad(() => repository.getInquiries(), [] as Inquiry[]),
      safeLoad(() => repository.getQuotes(), [] as Quote[]),
      safeLoad(() => repository.getPayments(), [] as Payment[]),
      safeLoad(() => repository.getSiteSettings(), DEFAULT_SITE_SETTINGS),
    ]);
    setProjects(projectData);
    setServices(serviceData);
    setPlans(planData);
    setClients(clientData);
    setInquiries(inquiryData);
    setQuotes(quoteData);
    setPayments(paymentData);
    setSiteSettings({ ...DEFAULT_SITE_SETTINGS, ...settingsData, socials: { ...(settingsData.socials ?? {}) } });
    setLoading(false);
  };

  useEffect(() => {
    void loadDatabase();
  }, [isLoggedIn]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError('');

    if (!supabase) {
      setAuthError('Supabase 尚未啟用。請先在 Render 設定 Supabase 環境變數。');
      return;
    }

    setAuthLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);

    if (error) {
      setAuthError('登入失敗，請確認密碼是否正確，以及 Supabase 使用者是否已建立。');
      return;
    }

    if (data.user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      await supabase.auth.signOut();
      setAuthError('這個帳號沒有 CK Studio 管理員權限。');
      return;
    }

    setPassword('');
    onLoginSuccess();
  };

  const handleSaveProject = async () => {
    if (!editingProject) return;
    if (!editingProject.titleZh.trim() || !editingProject.titleEn.trim() || !editingProject.slug.trim()) {
      alert('請填寫網址代稱、中文名稱與英文名稱。');
      return;
    }

    const payload: Project = {
      ...editingProject,
      id: editingProject.id || createId('project'),
      createdAt: editingProject.createdAt || nowIso(),
      updatedAt: nowIso(),
    };

    if (editingProject.createdAt) await repository.updateProject(editingProject.id, payload);
    else await repository.createProject(payload);

    setEditingProject(null);
    await loadDatabase();
    flash('作品資料已儲存');
  };

  const handleToggleProjectPublish = async (project: Project) => {
    const isPublished = project.status === 'active';
    await repository.updateProject(project.id, { status: isPublished ? 'paused' : 'active' });
    await loadDatabase();
    flash(isPublished ? '作品已下架' : '作品已上架');
  };

  const handleDeleteProject = async (project: Project) => {
    if (!window.confirm(`確定永久刪除「${project.titleZh}」嗎？`)) return;
    await repository.deleteProject(project.id);
    await loadDatabase();
    flash('作品已刪除');
  };

  const handleSaveService = async () => {
    if (!editingService) return;
    if (!editingService.titleZh.trim() || !editingService.titleEn.trim() || !editingService.categoryId.trim()) {
      alert('請填寫分類、中文名稱與英文名稱。');
      return;
    }

    const payload: Service = {
      ...editingService,
      id: editingService.id || createId('service'),
      createdAt: editingService.createdAt || nowIso(),
      updatedAt: nowIso(),
    };

    if (editingService.createdAt) await repository.updateService(editingService.id, payload);
    else await repository.createService(payload);

    setEditingService(null);
    await loadDatabase();
    flash('服務項目已儲存');
  };

  const handleToggleServicePublish = async (service: Service) => {
    const isPublished = service.isPublic && service.visibility === 'public' && service.status === 'active';
    await repository.updateService(service.id, isPublished
      ? { isPublic: false, visibility: 'hidden', status: 'hidden' }
      : { isPublic: true, visibility: 'public', status: 'active' });
    await loadDatabase();
    flash(isPublished ? '服務已下架' : '服務已上架');
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;
    if (!editingPlan.nameZh.trim() || !editingPlan.nameEn.trim()) {
      alert('請填寫中文方案名稱與英文方案名稱。');
      return;
    }

    const repo = repository as any;
    const payload: PricingPlan = {
      ...editingPlan,
      id: editingPlan.id || createId('plan'),
      createdAt: editingPlan.createdAt || nowIso(),
      updatedAt: nowIso(),
    };

    if (editingPlan.createdAt && typeof repo.updatePricingPlan === 'function') {
      await repo.updatePricingPlan(editingPlan.id, payload);
    } else if (!editingPlan.createdAt && typeof repo.createPricingPlan === 'function') {
      await repo.createPricingPlan(payload);
    } else {
      const next = editingPlan.createdAt
        ? plans.map((plan) => plan.id === editingPlan.id ? payload : plan)
        : [...plans, payload];
      repo.savePricingPlans(next);
    }

    setEditingPlan(null);
    await loadDatabase();
    flash('價格方案已儲存');
  };

  const handleTogglePlanPublish = async (plan: PricingPlan) => {
    const repo = repository as any;
    const isPublished = plan.visibility === 'public' && plan.status === 'active';
    const updates = isPublished
      ? { visibility: 'hidden', status: 'paused' }
      : { visibility: 'public', status: 'active' };

    if (typeof repo.updatePricingPlan === 'function') {
      await repo.updatePricingPlan(plan.id, updates);
    } else {
      repo.savePricingPlans(plans.map((item) => item.id === plan.id ? { ...item, ...updates } : item));
    }
    await loadDatabase();
    flash(isPublished ? '方案已下架' : '方案已上架');
  };

  const handleSaveSiteSettings = async () => {
    const repo = repository as any;
    if (typeof repo.updateSiteSettings === 'function') await repo.updateSiteSettings(siteSettings);
    else repo.saveSiteSettings(siteSettings);
    await loadDatabase();
    flash('網站設定已儲存');
  };

  const filteredProjects = useMemo(() => projects.filter((item) => `${item.titleZh} ${item.titleEn} ${item.category}`.toLowerCase().includes(searchQuery.toLowerCase())), [projects, searchQuery]);
  const filteredServices = useMemo(() => services.filter((item) => `${item.titleZh} ${item.titleEn} ${item.categoryId}`.toLowerCase().includes(searchQuery.toLowerCase())), [services, searchQuery]);

  if (!isLoggedIn) {
    return (
      <div className="relative flex min-h-[78vh] items-center justify-center overflow-hidden bg-[var(--bg)] px-5 py-12 text-[var(--text-primary)]">
        <div className="ambient-glow" />
        <div className="grid-bg" />
        <div className="glass-card relative z-10 w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-7 shadow-2xl">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
              <LockKeyhole size={22} />
            </div>
            <h1 className="text-xl font-bold">CK Studio 管理後台</h1>
            <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">使用 Supabase 管理員帳號登入，所有修改會同步到雲端資料庫。</p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <Field label="管理員帳號">
              <input value={email} readOnly className={`${inputClass} cursor-not-allowed opacity-75`} />
            </Field>
            <Field label="密碼">
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
                placeholder="輸入你在 Supabase 設定的密碼"
              />
            </Field>
            {authError && <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{authError}</p>}
            <button type="submit" disabled={authLoading} className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60">
              {authLoading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              登入管理後台
            </button>
          </form>

          <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--border-subtle)]/50 p-3 text-[10px] leading-5 text-[var(--text-secondary)]">
            舊版的 <code>admin123</code> 已停用。正式後台只接受 <strong>{ADMIN_EMAIL}</strong>。
          </div>
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: '總覽', icon: <Activity size={14} /> },
    { id: 'projects', label: '作品管理', icon: <FolderKanban size={14} /> },
    { id: 'services', label: '服務管理', icon: <Layers3 size={14} /> },
    { id: 'pricing', label: '方案管理', icon: <CircleDollarSign size={14} /> },
    { id: 'crm', label: '客戶與詢問', icon: <Users size={14} /> },
    { id: 'quotes', label: '報價單', icon: <FileText size={14} /> },
    { id: 'payments', label: '付款紀錄', icon: <BriefcaseBusiness size={14} /> },
    { id: 'settings', label: '網站設定', icon: <Settings size={14} /> },
  ];

  const publishedProjectCount = projects.filter((item) => item.status === 'active').length;
  const publishedServiceCount = services.filter((item) => item.isPublic && item.visibility === 'public' && item.status === 'active').length;
  const paidRevenue = payments.filter((item) => item.status === 'paid').reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <header className="sticky top-20 z-30 border-b border-[var(--border)] bg-[var(--bg-elevated)]/95 px-5 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
              <ShieldCheck size={13} />
              {isUsingSupabase ? 'Supabase 雲端後台已連線' : '本機測試模式'}
            </div>
            <h1 className="mt-1 text-xl font-bold">CK Studio 管理系統</h1>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">管理作品、服務、價格方案、客戶資料與前台網站內容。</p>
          </div>
          <div className="flex items-center gap-2">
            {saveMessage && <span className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400"><Check size={13} className="mr-1 inline" />{saveMessage}</span>}
            <button onClick={() => void loadDatabase()} className="flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-xs font-semibold hover:bg-[var(--border-subtle)]">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />重新整理
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b border-[var(--border)] bg-[var(--bg-elevated)]/70 px-4 overflow-x-auto">
        <div className="mx-auto flex max-w-7xl min-w-max gap-1 py-2">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setEditingProject(null); setEditingService(null); setEditingPlan(null); }} className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition ${activeTab === tab.id ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)]'}`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-5 py-7">
        {loading && <div className="mb-5 flex items-center gap-2 text-xs text-[var(--text-secondary)]"><Loader2 size={14} className="animate-spin" />正在同步資料...</div>}

        {activeTab === 'dashboard' && (
          <div className="space-y-7">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                ['已上架作品', publishedProjectCount, `${projects.length} 個作品`],
                ['已上架服務', publishedServiceCount, `${services.length} 個服務`],
                ['新詢問', inquiries.filter((item) => item.status === 'new').length, `${inquiries.length} 筆詢問`],
                ['已收款金額', `NT$ ${paidRevenue.toLocaleString()}`, `${payments.length} 筆付款`],
              ].map(([label, value, note]) => (
                <div key={String(label)} className="glass-card rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
                  <p className="text-xs font-semibold text-[var(--text-secondary)]">{label}</p>
                  <p className="mt-3 text-2xl font-black">{value}</p>
                  <p className="mt-1 text-[10px] text-[var(--text-secondary)]">{note}</p>
                </div>
              ))}
            </div>
            <div className="glass-card rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
              <h2 className="text-sm font-bold">建議操作順序</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {[
                  ['1', '網站設定', '先填寫工作室名稱、LINE、預約網址和聯絡資訊。', 'settings'],
                  ['2', '服務與方案', '設定價格、說明、顯示頁面和上架狀態。', 'services'],
                  ['3', '作品案例', '補齊問題、解法、成果與技術堆疊。', 'projects'],
                ].map(([number, title, description, tab]) => (
                  <button key={String(number)} onClick={() => setActiveTab(tab as AdminTab)} className="rounded-md border border-[var(--border)] bg-[var(--border-subtle)]/40 p-4 text-left hover:border-[var(--accent)]">
                    <span className="text-[10px] font-black text-[var(--accent)]">STEP {number}</span>
                    <span className="mt-2 flex items-center justify-between text-sm font-bold">{title}<ChevronRight size={14} /></span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--text-secondary)]">{description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="text-lg font-bold">作品案例管理</h2><p className="text-xs text-[var(--text-secondary)]">編輯完整案例內容，並控制前台上架或下架。</p></div>
              <button onClick={() => setEditingProject({ ...EMPTY_PROJECT })} className="flex items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2.5 text-xs font-bold text-white"><Plus size={14} />新增作品</button>
            </div>
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className={inputClass} placeholder="搜尋作品名稱或分類" />

            {editingProject && (
              <div className="glass-card rounded-lg border border-[var(--accent)]/30 bg-[var(--bg-elevated)] p-5 md:p-7">
                <div className="mb-5 flex items-center justify-between"><h3 className="font-bold">{editingProject.createdAt ? '編輯作品' : '新增作品'}</h3><button onClick={() => setEditingProject(null)}><X size={18} /></button></div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="網址代稱 Slug"><input className={inputClass} value={editingProject.slug} onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value.trim().toLowerCase().replace(/\s+/g, '-') })} /></Field>
                  <Field label="分類"><input className={inputClass} value={editingProject.category} onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })} /></Field>
                  <Field label="中文名稱"><input className={inputClass} value={editingProject.titleZh} onChange={(e) => setEditingProject({ ...editingProject, titleZh: e.target.value })} /></Field>
                  <Field label="英文名稱"><input className={inputClass} value={editingProject.titleEn} onChange={(e) => setEditingProject({ ...editingProject, titleEn: e.target.value })} /></Field>
                  <Field label="中文短說明" full><textarea className={textareaClass} value={editingProject.descriptionZh} onChange={(e) => setEditingProject({ ...editingProject, descriptionZh: e.target.value })} /></Field>
                  <Field label="英文短說明" full><textarea className={textareaClass} value={editingProject.descriptionEn} onChange={(e) => setEditingProject({ ...editingProject, descriptionEn: e.target.value })} /></Field>
                  <Field label="中文完整介紹" full><textarea className={`${textareaClass} min-h-36`} value={editingProject.longDescriptionZh} onChange={(e) => setEditingProject({ ...editingProject, longDescriptionZh: e.target.value })} /></Field>
                  <Field label="英文完整介紹" full><textarea className={`${textareaClass} min-h-36`} value={editingProject.longDescriptionEn} onChange={(e) => setEditingProject({ ...editingProject, longDescriptionEn: e.target.value })} /></Field>
                  <Field label="問題／背景（中文）"><textarea className={textareaClass} value={editingProject.problemZh || ''} onChange={(e) => setEditingProject({ ...editingProject, problemZh: e.target.value })} /></Field>
                  <Field label="問題／背景（英文）"><textarea className={textareaClass} value={editingProject.problemEn || ''} onChange={(e) => setEditingProject({ ...editingProject, problemEn: e.target.value })} /></Field>
                  <Field label="解決方案（中文）"><textarea className={textareaClass} value={editingProject.solutionZh || ''} onChange={(e) => setEditingProject({ ...editingProject, solutionZh: e.target.value })} /></Field>
                  <Field label="解決方案（英文）"><textarea className={textareaClass} value={editingProject.solutionEn || ''} onChange={(e) => setEditingProject({ ...editingProject, solutionEn: e.target.value })} /></Field>
                  <Field label="成果（中文）"><textarea className={textareaClass} value={editingProject.resultZh || ''} onChange={(e) => setEditingProject({ ...editingProject, resultZh: e.target.value })} /></Field>
                  <Field label="成果（英文）"><textarea className={textareaClass} value={editingProject.resultEn || ''} onChange={(e) => setEditingProject({ ...editingProject, resultEn: e.target.value })} /></Field>
                  <Field label="技術堆疊" hint="每行一項"><textarea className={textareaClass} value={arrayToLines(editingProject.techStack)} onChange={(e) => setEditingProject({ ...editingProject, techStack: linesToArray(e.target.value) })} /></Field>
                  <Field label="中文特色" hint="每行一項"><textarea className={textareaClass} value={arrayToLines(editingProject.featuresZh)} onChange={(e) => setEditingProject({ ...editingProject, featuresZh: linesToArray(e.target.value) })} /></Field>
                  <Field label="英文特色" hint="每行一項"><textarea className={textareaClass} value={arrayToLines(editingProject.featuresEn)} onChange={(e) => setEditingProject({ ...editingProject, featuresEn: linesToArray(e.target.value) })} /></Field>
                  <Field label="封面樣式"><select className={inputClass} value={editingProject.coverStyle} onChange={(e) => setEditingProject({ ...editingProject, coverStyle: e.target.value as ProjectCoverStyle })}>{['purple-glow','emerald-grid','blue-nodes','titanium-metal','sunset-orange'].map((value) => <option key={value} value={value}>{value}</option>)}</select></Field>
                  <Field label="狀態"><select className={inputClass} value={editingProject.status} onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as Project['status'] })}><option value="active">上架</option><option value="coming_soon">即將推出</option><option value="beta">測試中</option><option value="paused">下架</option><option value="internal">內部</option><option value="archived">封存</option></select></Field>
                  <Field label="排序"><input type="number" className={inputClass} value={editingProject.sortOrder} onChange={(e) => setEditingProject({ ...editingProject, sortOrder: Number(e.target.value) })} /></Field>
                  <div className="md:col-span-2"><Toggle checked={editingProject.isFeatured} onChange={(checked) => setEditingProject({ ...editingProject, isFeatured: checked })} label="首頁精選作品" /></div>
                </div>
                <div className="mt-6 flex justify-end gap-3"><button onClick={() => setEditingProject(null)} className="rounded-md border border-[var(--border)] px-4 py-2 text-xs font-semibold">取消</button><button onClick={() => void handleSaveProject()} className="flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-2 text-xs font-bold text-white"><Save size={14} />儲存作品</button></div>
              </div>
            )}

            <div className="grid gap-3">
              {filteredProjects.map((project) => {
                const active = project.status === 'active';
                return <div key={project.id} className="glass-card flex flex-col gap-4 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4 md:flex-row md:items-center md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{project.titleZh}</h3><StatusBadge active={active} /><span className="text-[10px] text-[var(--text-secondary)]">/{project.slug}</span></div><p className="mt-1 text-xs text-[var(--text-secondary)]">{project.category} · 排序 {project.sortOrder}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => void handleToggleProjectPublish(project)} className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-2 text-xs font-semibold">{active ? <EyeOff size={13} /> : <Eye size={13} />}{active ? '下架' : '上架'}</button><button onClick={() => setEditingProject({ ...project })} className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-2 text-xs font-semibold"><Pencil size={13} />編輯</button><button onClick={() => void handleDeleteProject(project)} className="rounded-md border border-red-500/25 px-3 py-2 text-red-400"><Trash2 size={13} /></button></div></div>;
              })}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-bold">服務項目管理</h2><p className="text-xs text-[var(--text-secondary)]">可控制價格、交付內容、需求、按鈕以及每個頁面的顯示狀態。</p></div><button onClick={() => setEditingService({ ...EMPTY_SERVICE })} className="flex items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2.5 text-xs font-bold text-white"><Plus size={14} />新增服務</button></div>
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className={inputClass} placeholder="搜尋服務名稱或分類" />

            {editingService && (
              <div className="glass-card rounded-lg border border-[var(--accent)]/30 bg-[var(--bg-elevated)] p-5 md:p-7">
                <div className="mb-5 flex items-center justify-between"><h3 className="font-bold">{editingService.createdAt ? '編輯服務' : '新增服務'}</h3><button onClick={() => setEditingService(null)}><X size={18} /></button></div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="分類 ID"><input className={inputClass} value={editingService.categoryId} onChange={(e) => setEditingService({ ...editingService, categoryId: e.target.value })} placeholder="例如 consultation、automation" /></Field>
                  <Field label="排序"><input type="number" className={inputClass} value={editingService.sortOrder} onChange={(e) => setEditingService({ ...editingService, sortOrder: Number(e.target.value) })} /></Field>
                  <Field label="中文名稱"><input className={inputClass} value={editingService.titleZh} onChange={(e) => setEditingService({ ...editingService, titleZh: e.target.value })} /></Field>
                  <Field label="英文名稱"><input className={inputClass} value={editingService.titleEn} onChange={(e) => setEditingService({ ...editingService, titleEn: e.target.value })} /></Field>
                  <Field label="中文短說明" full><textarea className={textareaClass} value={editingService.shortDescriptionZh} onChange={(e) => setEditingService({ ...editingService, shortDescriptionZh: e.target.value })} /></Field>
                  <Field label="英文短說明" full><textarea className={textareaClass} value={editingService.shortDescriptionEn} onChange={(e) => setEditingService({ ...editingService, shortDescriptionEn: e.target.value })} /></Field>
                  <Field label="中文完整說明" full><textarea className={`${textareaClass} min-h-36`} value={editingService.longDescriptionZh} onChange={(e) => setEditingService({ ...editingService, longDescriptionZh: e.target.value })} /></Field>
                  <Field label="英文完整說明" full><textarea className={`${textareaClass} min-h-36`} value={editingService.longDescriptionEn} onChange={(e) => setEditingService({ ...editingService, longDescriptionEn: e.target.value })} /></Field>
                  <Field label="基礎價格"><input type="number" className={inputClass} value={editingService.basePrice} onChange={(e) => setEditingService({ ...editingService, basePrice: Number(e.target.value) })} /></Field>
                  <Field label="幣別"><input className={inputClass} value={editingService.currency} onChange={(e) => setEditingService({ ...editingService, currency: e.target.value })} /></Field>
                  <Field label="中文價格標籤"><input className={inputClass} value={editingService.priceLabelZh} onChange={(e) => setEditingService({ ...editingService, priceLabelZh: e.target.value })} placeholder="例如：起、每月、客製報價" /></Field>
                  <Field label="英文價格標籤"><input className={inputClass} value={editingService.priceLabelEn} onChange={(e) => setEditingService({ ...editingService, priceLabelEn: e.target.value })} /></Field>
                  <Field label="計價方式"><select className={inputClass} value={editingService.billingType} onChange={(e) => setEditingService({ ...editingService, billingType: e.target.value as Service['billingType'] })}><option value="fixed">固定價格</option><option value="starting_from">起價</option><option value="hourly">時薪</option><option value="monthly">月費</option><option value="yearly">年費</option><option value="custom_quote">客製報價</option></select></Field>
                  <Field label="訂金比例 %"><input type="number" min="0" max="100" className={inputClass} value={editingService.depositPercent} onChange={(e) => setEditingService({ ...editingService, depositPercent: Number(e.target.value) })} /></Field>
                  <Field label="預計交付天數"><input type="number" className={inputClass} value={editingService.estimatedDeliveryDays} onChange={(e) => setEditingService({ ...editingService, estimatedDeliveryDays: Number(e.target.value) })} /></Field>
                  <Field label="修改次數"><input type="number" className={inputClass} value={editingService.revisionCount} onChange={(e) => setEditingService({ ...editingService, revisionCount: Number(e.target.value) })} /></Field>
                  <Field label="中文交付內容" hint="每行一項"><textarea className={textareaClass} value={arrayToLines(editingService.deliverablesZh)} onChange={(e) => setEditingService({ ...editingService, deliverablesZh: linesToArray(e.target.value) })} /></Field>
                  <Field label="英文交付內容" hint="每行一項"><textarea className={textareaClass} value={arrayToLines(editingService.deliverablesEn)} onChange={(e) => setEditingService({ ...editingService, deliverablesEn: linesToArray(e.target.value) })} /></Field>
                  <Field label="中文客戶需提供資料" hint="每行一項"><textarea className={textareaClass} value={arrayToLines(editingService.requirementsZh)} onChange={(e) => setEditingService({ ...editingService, requirementsZh: linesToArray(e.target.value) })} /></Field>
                  <Field label="英文客戶需提供資料" hint="每行一項"><textarea className={textareaClass} value={arrayToLines(editingService.requirementsEn)} onChange={(e) => setEditingService({ ...editingService, requirementsEn: linesToArray(e.target.value) })} /></Field>
                  <Field label="狀態"><select className={inputClass} value={editingService.status} onChange={(e) => setEditingService({ ...editingService, status: e.target.value as Service['status'] })}><option value="draft">草稿</option><option value="active">上架</option><option value="coming_soon">即將推出</option><option value="beta">測試中</option><option value="hidden">下架</option><option value="paused">暫停</option><option value="internal">內部</option><option value="archived">封存</option></select></Field>
                  <Field label="可見性"><select className={inputClass} value={editingService.visibility} onChange={(e) => setEditingService({ ...editingService, visibility: e.target.value as Service['visibility'] })}><option value="public">公開</option><option value="hidden">隱藏</option><option value="private">私人</option></select></Field>
                  <Field label="接案狀態"><select className={inputClass} value={editingService.availability} onChange={(e) => setEditingService({ ...editingService, availability: e.target.value as Service['availability'] })}><option value="available_now">目前可接案</option><option value="consultation_required">需要先諮詢</option><option value="waitlist">候補名單</option><option value="not_available">暫不提供</option></select></Field>
                  <Field label="Stripe Price ID"><input className={inputClass} value={editingService.stripePriceId} onChange={(e) => setEditingService({ ...editingService, stripePriceId: e.target.value })} /></Field>
                  <Field label="Stripe Payment Link" full><input className={inputClass} value={editingService.stripePaymentLink} onChange={(e) => setEditingService({ ...editingService, stripePaymentLink: e.target.value })} /></Field>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <Toggle checked={editingService.showPrice} onChange={(v) => setEditingService({ ...editingService, showPrice: v })} label="顯示價格" />
                  <Toggle checked={editingService.isPublic} onChange={(v) => setEditingService({ ...editingService, isPublic: v })} label="公開服務" />
                  <Toggle checked={editingService.isFeatured} onChange={(v) => setEditingService({ ...editingService, isFeatured: v })} label="精選服務" />
                  <Toggle checked={editingService.showOnHome} onChange={(v) => setEditingService({ ...editingService, showOnHome: v })} label="顯示於首頁" />
                  <Toggle checked={editingService.showOnServicesPage} onChange={(v) => setEditingService({ ...editingService, showOnServicesPage: v })} label="顯示於服務頁" />
                  <Toggle checked={editingService.showOnPricingPage} onChange={(v) => setEditingService({ ...editingService, showOnPricingPage: v })} label="顯示於價格頁" />
                  <Toggle checked={editingService.showOnStartProjectPage} onChange={(v) => setEditingService({ ...editingService, showOnStartProjectPage: v })} label="顯示於開始專案頁" />
                  <Toggle checked={editingService.showInQuoteBuilder} onChange={(v) => setEditingService({ ...editingService, showInQuoteBuilder: v })} label="報價單可選" />
                  <Toggle checked={editingService.allowDirectCheckout} onChange={(v) => setEditingService({ ...editingService, allowDirectCheckout: v })} label="允許直接付款" />
                  <Toggle checked={editingService.allowQuoteRequest} onChange={(v) => setEditingService({ ...editingService, allowQuoteRequest: v })} label="允許索取報價" />
                  <Toggle checked={editingService.allowLineConsultation} onChange={(v) => setEditingService({ ...editingService, allowLineConsultation: v })} label="顯示 LINE 諮詢" />
                  <Toggle checked={editingService.allowBooking} onChange={(v) => setEditingService({ ...editingService, allowBooking: v })} label="允許預約會議" />
                  <Toggle checked={editingService.allowWaitlist} onChange={(v) => setEditingService({ ...editingService, allowWaitlist: v })} label="允許候補" />
                  <Toggle checked={editingService.requiresMeeting} onChange={(v) => setEditingService({ ...editingService, requiresMeeting: v })} label="必須先開會" />
                  <Toggle checked={editingService.requiresContract} onChange={(v) => setEditingService({ ...editingService, requiresContract: v })} label="需要合約" />
                  <Toggle checked={editingService.requiresRemoteAccess} onChange={(v) => setEditingService({ ...editingService, requiresRemoteAccess: v })} label="需要遠端存取" />
                  <Toggle checked={editingService.requiresClientMaterials} onChange={(v) => setEditingService({ ...editingService, requiresClientMaterials: v })} label="需要客戶提供素材" />
                </div>
                <div className="mt-6 flex justify-end gap-3"><button onClick={() => setEditingService(null)} className="rounded-md border border-[var(--border)] px-4 py-2 text-xs font-semibold">取消</button><button onClick={() => void handleSaveService()} className="flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-2 text-xs font-bold text-white"><Save size={14} />儲存服務</button></div>
              </div>
            )}

            <div className="grid gap-3">
              {filteredServices.map((service) => {
                const active = service.isPublic && service.visibility === 'public' && service.status === 'active';
                return <div key={service.id} className="glass-card flex flex-col gap-4 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4 md:flex-row md:items-center md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{service.titleZh}</h3><StatusBadge active={active} /><span className="text-[10px] text-[var(--text-secondary)]">{service.categoryId}</span></div><p className="mt-1 text-xs text-[var(--text-secondary)]">{service.showPrice ? `${service.currency} ${Number(service.basePrice).toLocaleString()} ${service.priceLabelZh}` : '價格不公開'} · {service.availability}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => void handleToggleServicePublish(service)} className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-2 text-xs font-semibold">{active ? <EyeOff size={13} /> : <Eye size={13} />}{active ? '下架' : '上架'}</button><button onClick={() => setEditingService({ ...service })} className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-2 text-xs font-semibold"><Pencil size={13} />編輯細項</button></div></div>;
              })}
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-bold">價格方案管理</h2><p className="text-xs text-[var(--text-secondary)]">管理前台價格卡、推薦方案、功能清單與上架狀態。</p></div><button onClick={() => setEditingPlan({ ...EMPTY_PLAN })} className="flex items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2.5 text-xs font-bold text-white"><Plus size={14} />新增方案</button></div>
            {editingPlan && <div className="glass-card rounded-lg border border-[var(--accent)]/30 bg-[var(--bg-elevated)] p-5 md:p-7"><div className="mb-5 flex items-center justify-between"><h3 className="font-bold">{editingPlan.createdAt ? '編輯方案' : '新增方案'}</h3><button onClick={() => setEditingPlan(null)}><X size={18} /></button></div><div className="grid gap-4 md:grid-cols-2">
              <Field label="中文方案名稱"><input className={inputClass} value={editingPlan.nameZh} onChange={(e) => setEditingPlan({ ...editingPlan, nameZh: e.target.value })} /></Field><Field label="英文方案名稱"><input className={inputClass} value={editingPlan.nameEn} onChange={(e) => setEditingPlan({ ...editingPlan, nameEn: e.target.value })} /></Field>
              <Field label="中文說明"><textarea className={textareaClass} value={editingPlan.descriptionZh} onChange={(e) => setEditingPlan({ ...editingPlan, descriptionZh: e.target.value })} /></Field><Field label="英文說明"><textarea className={textareaClass} value={editingPlan.descriptionEn} onChange={(e) => setEditingPlan({ ...editingPlan, descriptionEn: e.target.value })} /></Field>
              <Field label="價格"><input type="number" className={inputClass} value={editingPlan.basePrice} onChange={(e) => setEditingPlan({ ...editingPlan, basePrice: Number(e.target.value) })} /></Field><Field label="計價方式"><select className={inputClass} value={editingPlan.billingType} onChange={(e) => setEditingPlan({ ...editingPlan, billingType: e.target.value as PricingPlan['billingType'] })}><option value="one-time">一次性</option><option value="monthly">月費</option><option value="yearly">年費</option><option value="milestone">里程碑</option></select></Field>
              <Field label="中文價格標籤"><input className={inputClass} value={editingPlan.priceLabelZh} onChange={(e) => setEditingPlan({ ...editingPlan, priceLabelZh: e.target.value })} /></Field><Field label="英文價格標籤"><input className={inputClass} value={editingPlan.priceLabelEn} onChange={(e) => setEditingPlan({ ...editingPlan, priceLabelEn: e.target.value })} /></Field>
              <Field label="訂金比例 %"><input type="number" className={inputClass} value={editingPlan.depositPercent} onChange={(e) => setEditingPlan({ ...editingPlan, depositPercent: Number(e.target.value) })} /></Field><Field label="交付天數"><input type="number" className={inputClass} value={editingPlan.estimatedDeliveryDays} onChange={(e) => setEditingPlan({ ...editingPlan, estimatedDeliveryDays: Number(e.target.value) })} /></Field>
              <Field label="修改次數"><input type="number" className={inputClass} value={editingPlan.revisionCount} onChange={(e) => setEditingPlan({ ...editingPlan, revisionCount: Number(e.target.value) })} /></Field><Field label="排序"><input type="number" className={inputClass} value={editingPlan.sortOrder} onChange={(e) => setEditingPlan({ ...editingPlan, sortOrder: Number(e.target.value) })} /></Field>
              <Field label="中文功能清單" hint="每行一項"><textarea className={textareaClass} value={arrayToLines(editingPlan.featuresZh)} onChange={(e) => setEditingPlan({ ...editingPlan, featuresZh: linesToArray(e.target.value) })} /></Field><Field label="英文功能清單" hint="每行一項"><textarea className={textareaClass} value={arrayToLines(editingPlan.featuresEn)} onChange={(e) => setEditingPlan({ ...editingPlan, featuresEn: linesToArray(e.target.value) })} /></Field>
              <Field label="狀態"><select className={inputClass} value={editingPlan.status} onChange={(e) => setEditingPlan({ ...editingPlan, status: e.target.value as PricingPlan['status'] })}><option value="active">上架</option><option value="coming_soon">即將推出</option><option value="beta">測試中</option><option value="paused">下架</option><option value="internal">內部</option><option value="archived">封存</option></select></Field><Field label="可見性"><select className={inputClass} value={editingPlan.visibility} onChange={(e) => setEditingPlan({ ...editingPlan, visibility: e.target.value as PricingPlan['visibility'] })}><option value="public">公開</option><option value="hidden">隱藏</option><option value="private">私人</option></select></Field>
            </div><div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4"><Toggle checked={editingPlan.isRecommended} onChange={(v) => setEditingPlan({ ...editingPlan, isRecommended: v })} label="推薦方案" /><Toggle checked={editingPlan.isFeatured} onChange={(v) => setEditingPlan({ ...editingPlan, isFeatured: v })} label="精選方案" /><Toggle checked={editingPlan.showOnHome} onChange={(v) => setEditingPlan({ ...editingPlan, showOnHome: v })} label="顯示於首頁" /><Toggle checked={editingPlan.showOnPricingPage} onChange={(v) => setEditingPlan({ ...editingPlan, showOnPricingPage: v })} label="顯示於價格頁" /><Toggle checked={editingPlan.showInQuoteBuilder} onChange={(v) => setEditingPlan({ ...editingPlan, showInQuoteBuilder: v })} label="報價單可選" /></div><div className="mt-6 flex justify-end gap-3"><button onClick={() => setEditingPlan(null)} className="rounded-md border border-[var(--border)] px-4 py-2 text-xs font-semibold">取消</button><button onClick={() => void handleSavePlan()} className="flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-2 text-xs font-bold text-white"><Save size={14} />儲存方案</button></div></div>}
            <div className="grid gap-3">{plans.map((plan) => { const active = plan.visibility === 'public' && plan.status === 'active'; return <div key={plan.id} className="glass-card flex flex-col gap-4 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4 md:flex-row md:items-center md:justify-between"><div><div className="flex items-center gap-2"><h3 className="font-bold">{plan.nameZh}</h3><StatusBadge active={active} /></div><p className="mt-1 text-xs text-[var(--text-secondary)]">{plan.currency} {Number(plan.basePrice).toLocaleString()} {plan.priceLabelZh}</p></div><div className="flex gap-2"><button onClick={() => void handleTogglePlanPublish(plan)} className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-2 text-xs font-semibold">{active ? <EyeOff size={13} /> : <Eye size={13} />}{active ? '下架' : '上架'}</button><button onClick={() => setEditingPlan({ ...plan })} className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-2 text-xs font-semibold"><Pencil size={13} />編輯</button></div></div>; })}</div>
          </div>
        )}

        {activeTab === 'crm' && <div className="space-y-5"><div><h2 className="text-lg font-bold">客戶與詢問</h2><p className="text-xs text-[var(--text-secondary)]">目前先提供檢視；下一階段會加入客戶狀態、備註、追蹤與一鍵建立報價。</p></div><div className="grid gap-4 lg:grid-cols-2"><div className="glass-card rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-5"><h3 className="mb-4 text-sm font-bold">最新詢問（{inquiries.length}）</h3><div className="space-y-3">{inquiries.slice(0, 20).map((item) => <div key={item.id} className="rounded-md border border-[var(--border)] p-3"><div className="flex justify-between gap-3"><strong className="text-sm">{item.name}</strong><span className="text-[10px] text-[var(--accent)]">{item.status}</span></div><p className="mt-1 text-xs text-[var(--text-secondary)]">{item.email} · {item.phone}</p><p className="mt-2 text-xs leading-5">{item.message}</p></div>)}</div></div><div className="glass-card rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-5"><h3 className="mb-4 text-sm font-bold">客戶資料（{clients.length}）</h3><div className="space-y-3">{clients.slice(0, 20).map((item) => <div key={item.id} className="rounded-md border border-[var(--border)] p-3"><div className="flex justify-between gap-3"><strong className="text-sm">{item.name}</strong><span className="text-[10px] text-[var(--text-secondary)]">{item.status}</span></div><p className="mt-1 text-xs text-[var(--text-secondary)]">{item.companyName || '個人客戶'} · {item.email}</p></div>)}</div></div></div></div>}

        {activeTab === 'quotes' && <div className="space-y-5"><div><h2 className="text-lg font-bold">報價單</h2><p className="text-xs text-[var(--text-secondary)]">下一階段會擴充完整報價編輯器、報價項目與客戶專屬連結。</p></div><div className="overflow-x-auto rounded-lg border border-[var(--border)]"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-[var(--border-subtle)]"><tr><th className="p-3">編號</th><th className="p-3">標題</th><th className="p-3">總額</th><th className="p-3">狀態</th><th className="p-3">有效期限</th></tr></thead><tbody>{quotes.map((item) => <tr key={item.id} className="border-t border-[var(--border)]"><td className="p-3 font-mono">{item.quoteNumber}</td><td className="p-3 font-semibold">{item.customTitleZh}</td><td className="p-3">NT$ {Number(item.total).toLocaleString()}</td><td className="p-3">{item.status}</td><td className="p-3">{item.validUntil ? new Date(item.validUntil).toLocaleDateString('zh-TW') : '-'}</td></tr>)}</tbody></table></div></div>}

        {activeTab === 'payments' && <div className="space-y-5"><div><h2 className="text-lg font-bold">付款紀錄</h2><p className="text-xs text-[var(--text-secondary)]">Stripe 正式串接完成前，請勿手動將未核對款項標記為已付款。</p></div><div className="overflow-x-auto rounded-lg border border-[var(--border)]"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-[var(--border-subtle)]"><tr><th className="p-3">付款編號</th><th className="p-3">金額</th><th className="p-3">方式</th><th className="p-3">狀態</th><th className="p-3">日期</th></tr></thead><tbody>{payments.map((item) => <tr key={item.id} className="border-t border-[var(--border)]"><td className="p-3 font-mono">{item.paymentNumber}</td><td className="p-3">{item.currency} {Number(item.amount).toLocaleString()}</td><td className="p-3">{item.provider}</td><td className="p-3">{item.status}</td><td className="p-3">{new Date(item.createdAt).toLocaleDateString('zh-TW')}</td></tr>)}</tbody></table></div></div>}

        {activeTab === 'settings' && <div className="space-y-5"><div><h2 className="text-lg font-bold">網站基本設定</h2><p className="text-xs text-[var(--text-secondary)]">修改後會同步到首頁、頁尾、LINE 諮詢與預約按鈕。</p></div><div className="glass-card rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-5 md:p-7"><div className="grid gap-4 md:grid-cols-2"><Field label="工作室名稱"><input className={inputClass} value={siteSettings.studioName} onChange={(e) => setSiteSettings({ ...siteSettings, studioName: e.target.value })} /></Field><Field label="聯絡 Email"><input type="email" className={inputClass} value={siteSettings.email} onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })} /></Field><Field label="中文標語" full><textarea className={textareaClass} value={siteSettings.taglineZh} onChange={(e) => setSiteSettings({ ...siteSettings, taglineZh: e.target.value })} /></Field><Field label="英文標語" full><textarea className={textareaClass} value={siteSettings.taglineEn} onChange={(e) => setSiteSettings({ ...siteSettings, taglineEn: e.target.value })} /></Field><Field label="電話"><input className={inputClass} value={siteSettings.phone} onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })} /></Field><Field label="品牌色"><input type="color" className={`${inputClass} h-10 p-1`} value={siteSettings.brandColor} onChange={(e) => setSiteSettings({ ...siteSettings, brandColor: e.target.value })} /></Field><Field label="官方 LINE 網址" full><input className={inputClass} value={siteSettings.officialLineUrl} onChange={(e) => setSiteSettings({ ...siteSettings, officialLineUrl: e.target.value })} placeholder="https://lin.ee/..." /></Field><Field label="預約會議網址" full><input className={inputClass} value={siteSettings.bookingUrl} onChange={(e) => setSiteSettings({ ...siteSettings, bookingUrl: e.target.value })} /></Field><Field label="GitHub 網址"><input className={inputClass} value={siteSettings.socials?.github || ''} onChange={(e) => setSiteSettings({ ...siteSettings, socials: { ...(siteSettings.socials || {}), github: e.target.value } })} /></Field><Field label="X / Twitter 網址"><input className={inputClass} value={siteSettings.socials?.twitter || ''} onChange={(e) => setSiteSettings({ ...siteSettings, socials: { ...(siteSettings.socials || {}), twitter: e.target.value } })} /></Field><Field label="預設語言"><select className={inputClass} value={siteSettings.defaultLanguage} onChange={(e) => setSiteSettings({ ...siteSettings, defaultLanguage: e.target.value as SiteSettings['defaultLanguage'] })}><option value="zh">繁體中文</option><option value="en">English</option></select></Field><Field label="預設主題"><select className={inputClass} value={siteSettings.defaultTheme} onChange={(e) => setSiteSettings({ ...siteSettings, defaultTheme: e.target.value as SiteSettings['defaultTheme'] })}><option value="dark">深色</option><option value="light">淺色</option></select></Field></div><div className="mt-6 flex justify-end"><button onClick={() => void handleSaveSiteSettings()} className="flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-2.5 text-xs font-bold text-white"><Save size={14} />儲存網站設定</button></div></div></div>}
      </main>
    </div>
  );
}

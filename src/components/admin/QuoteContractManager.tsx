import React, { useEffect, useMemo, useState } from 'react';
import {
  Check, Clipboard, ExternalLink, FileSignature, FileText, Link2,
  Loader2, Pencil, Plus, Save, Send, Trash2, UserPlus, X,
} from 'lucide-react';
import { repository } from '../../lib/repositories';
import {
  Client, Contract, ContractTemplate, PricingPlan, Quote, QuoteLineItem, Service,
} from '../../types';

type Section = 'quotes' | 'contracts';

interface Props {
  section: Section;
  onChanged?: () => Promise<void> | void;
}

const inputClass = 'w-full rounded-md border border-[var(--border)] bg-[var(--border-subtle)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]';
const textareaClass = `${inputClass} min-h-24 resize-y`;
const nowIso = () => new Date().toISOString();
const dateAfter = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function Field({ label, children, full = false, hint }: { label: string; children: React.ReactNode; full?: boolean; hint?: string }) {
  return <label className={`space-y-1.5 ${full ? 'md:col-span-2' : ''}`}><span className="block text-xs font-semibold text-[var(--text-secondary)]">{label}</span>{children}{hint && <span className="block text-[10px] text-[var(--text-secondary)]">{hint}</span>}</label>;
}

const emptyLineItem = (): QuoteLineItem => ({
  id: '', quoteId: '', titleZh: '', titleEn: '', descriptionZh: '', descriptionEn: '',
  quantity: 1, unitPrice: 0, amount: 0, type: 'custom',
});

const emptyQuote = (): Quote => ({
  id: '',
  quoteNumber: `Q-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
  clientId: '',
  selectedPlanId: undefined,
  contractTemplateId: undefined,
  customTitleZh: '', customTitleEn: '',
  subtotal: 0, discount: 0, tax: 0, total: 0,
  depositPercent: 50, depositAmount: 0, balanceAmount: 0,
  validUntil: dateAfter(14), publicToken: crypto.randomUUID(), status: 'draft',
  notesZh: '', notesEn: '',
  termsZh: '報價有效期限內確認；合約簽署與訂金入帳後正式排程。',
  termsEn: 'Scheduling begins after quote acceptance, contract signature, and deposit settlement.',
  lineItems: [emptyLineItem()], createdAt: '', updatedAt: '',
});

const emptyClient = (): Omit<Client, 'id' | 'createdAt' | 'updatedAt'> => ({
  type: 'company', name: '', companyName: '', taxId: '', contactName: '', email: '',
  phone: '', lineId: '', industry: '', source: 'Admin', notes: '', status: 'active',
});

const emptyTemplate = (): ContractTemplate => ({
  id: '', nameZh: '', nameEn: '', category: 'general', contentZh: '', contentEn: '',
  variables: ['clientName', 'companyName', 'projectNameZh', 'projectNameEn', 'serviceScopeZh', 'serviceScopeEn', 'totalAmount', 'depositPercent', 'depositAmount', 'balanceAmount'],
  status: 'active', version: 1, createdAt: '', updatedAt: '',
});

function statusLabel(status: string) {
  const map: Record<string, string> = {
    draft: '草稿', sent: '已寄送', viewed: '已查看', accepted: '已接受', rejected: '已拒絕',
    expired: '已過期', converted_to_contract: '已轉合約', signed: '已簽署', deposit_paid: '訂金已付',
    paid: '已付清', active: '執行中', completed: '已完成', cancelled: '已取消',
  };
  return map[status] || status;
}

export default function QuoteContractManager({ section, onChanged }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);
  const [newClient, setNewClient] = useState<ReturnType<typeof emptyClient> | null>(null);
  const [catalogSelection, setCatalogSelection] = useState('');

  const repo = repository as any;

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 2600);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [clientRows, quoteRows, contractRows, templateRows, serviceRows, planRows] = await Promise.all([
        repository.getClients(), repository.getQuotes(), repository.getContracts(),
        repo.getContractTemplates(), repository.getServices(), repository.getPricingPlans(),
      ]);
      setClients(clientRows);
      setQuotes(quoteRows);
      setContracts(contractRows);
      setTemplates(templateRows);
      setServices(serviceRows.filter((item: Service) => item.showInQuoteBuilder));
      setPlans(planRows.filter((item: PricingPlan) => item.showInQuoteBuilder));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const recalculate = (quote: Quote): Quote => {
    const lineItems = quote.lineItems.map((item) => ({
      ...item,
      quantity: Math.max(1, Number(item.quantity || 1)),
      unitPrice: Math.max(0, Number(item.unitPrice || 0)),
      amount: Math.max(1, Number(item.quantity || 1)) * Math.max(0, Number(item.unitPrice || 0)),
    }));
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const total = Math.max(0, subtotal - Number(quote.discount || 0) + Number(quote.tax || 0));
    const depositAmount = Math.round(total * Number(quote.depositPercent || 0) / 100);
    return { ...quote, lineItems, subtotal, total, depositAmount, balanceAmount: total - depositAmount };
  };

  const calculatedQuote = useMemo(() => editingQuote ? recalculate(editingQuote) : null, [editingQuote]);

  const updateLine = (index: number, updates: Partial<QuoteLineItem>) => {
    if (!editingQuote) return;
    const lineItems = editingQuote.lineItems.map((item, itemIndex) => itemIndex === index ? { ...item, ...updates } : item);
    setEditingQuote(recalculate({ ...editingQuote, lineItems }));
  };

  const addCatalogItem = () => {
    if (!editingQuote || !catalogSelection) return;
    const [kind, id] = catalogSelection.split(':');
    if (kind === 'service') {
      const item = services.find((row) => row.id === id);
      if (!item) return;
      setEditingQuote(recalculate({ ...editingQuote, lineItems: [...editingQuote.lineItems, {
        ...emptyLineItem(), id: makeId('line'), titleZh: item.titleZh, titleEn: item.titleEn,
        descriptionZh: item.shortDescriptionZh, descriptionEn: item.shortDescriptionEn,
        unitPrice: Number(item.basePrice), amount: Number(item.basePrice), type: 'service',
      }] }));
    } else {
      const plan = plans.find((row) => row.id === id);
      if (!plan) return;
      setEditingQuote(recalculate({ ...editingQuote, selectedPlanId: plan.id, depositPercent: plan.depositPercent, lineItems: [...editingQuote.lineItems, {
        ...emptyLineItem(), id: makeId('line'), titleZh: plan.nameZh, titleEn: plan.nameEn,
        descriptionZh: plan.descriptionZh, descriptionEn: plan.descriptionEn,
        unitPrice: Number(plan.basePrice), amount: Number(plan.basePrice), type: 'service',
      }] }));
    }
    setCatalogSelection('');
  };

  const saveQuote = async (forceStatus?: Quote['status']) => {
    if (!calculatedQuote) return;
    if (!calculatedQuote.clientId || !calculatedQuote.customTitleZh.trim()) {
      alert('請選擇客戶並填寫中文專案名稱。');
      return;
    }
    const cleaned = recalculate({
      ...calculatedQuote,
      status: forceStatus ?? calculatedQuote.status,
      lineItems: calculatedQuote.lineItems.filter((item) => item.titleZh.trim() && item.unitPrice >= 0),
      updatedAt: nowIso(),
    });
    if (!cleaned.lineItems.length) {
      alert('報價單至少需要一個項目。');
      return;
    }
    setBusy(true);
    try {
      if (cleaned.id) await repo.updateQuote(cleaned.id, cleaned);
      else await repo.createQuote({ ...cleaned, createdAt: undefined, updatedAt: undefined });
      setEditingQuote(null);
      await load();
      await onChanged?.();
      flash(forceStatus === 'sent' ? '報價單已發布，可以傳送客戶連結' : '報價單已儲存');
    } catch (error: any) {
      alert(error?.message || '報價單儲存失敗');
    } finally {
      setBusy(false);
    }
  };

  const saveClient = async () => {
    if (!newClient || !newClient.name.trim() || !newClient.contactName.trim() || !newClient.email.trim()) {
      alert('請填寫客戶名稱、聯絡人與 Email。');
      return;
    }
    setBusy(true);
    try {
      const created = await repo.createClient(newClient);
      setNewClient(null);
      await load();
      if (editingQuote) setEditingQuote({ ...editingQuote, clientId: created.id });
      flash('客戶已建立');
    } finally { setBusy(false); }
  };

  const copyLink = async (token: string) => {
    const url = `${window.location.origin}/client/${token}`;
    await navigator.clipboard.writeText(url);
    flash('客戶連結已複製');
  };

  const createContract = async (quote: Quote) => {
    setBusy(true);
    try {
      await repo.createContractFromQuote(quote, quote.contractTemplateId);
      await repo.updateQuoteStatus(quote.id, quote.status === 'draft' ? 'sent' : quote.status);
      await load();
      await onChanged?.();
      flash('合約已從報價單建立');
    } catch (error: any) {
      alert(error?.message || '合約建立失敗');
    } finally { setBusy(false); }
  };

  const saveContract = async () => {
    if (!editingContract) return;
    setBusy(true);
    try {
      await repo.updateContract(editingContract.id, editingContract);
      setEditingContract(null);
      await load();
      flash('合約已儲存');
    } finally { setBusy(false); }
  };

  const saveTemplate = async () => {
    if (!editingTemplate?.nameZh.trim() || !editingTemplate.contentZh.trim()) {
      alert('請填寫範本名稱與中文內容。');
      return;
    }
    setBusy(true);
    try {
      if (editingTemplate.id) await repo.updateContractTemplate(editingTemplate.id, editingTemplate);
      else await repo.createContractTemplate({ ...editingTemplate, createdAt: undefined, updatedAt: undefined });
      setEditingTemplate(null);
      await load();
      flash('合約範本已儲存');
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold">{section === 'quotes' ? '報價單管理' : '合約與範本管理'}</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">{section === 'quotes' ? '建立客戶專屬報價、價格明細、有效期限與安全連結。' : '由報價單產生合約、編輯條款、傳送電子簽署連結。'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {message && <span className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400"><Check size={13} className="mr-1 inline" />{message}</span>}
          {section === 'quotes' && <><button onClick={() => setNewClient(emptyClient())} className="flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-xs font-semibold"><UserPlus size={14} />新增客戶</button><button onClick={() => setEditingQuote(emptyQuote())} className="flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white"><Plus size={14} />新增報價單</button></>}
          {section === 'contracts' && <button onClick={() => setEditingTemplate(emptyTemplate())} className="flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white"><Plus size={14} />新增合約範本</button>}
        </div>
      </div>

      {loading && <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><Loader2 size={14} className="animate-spin" />載入中</div>}

      {newClient && <div className="glass-card rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-5"><div className="mb-4 flex items-center justify-between"><h3 className="font-bold">新增客戶</h3><button onClick={() => setNewClient(null)}><X size={16} /></button></div><div className="grid gap-4 md:grid-cols-2">
        <Field label="客戶類型"><select className={inputClass} value={newClient.type} onChange={(e) => setNewClient({ ...newClient, type: e.target.value as Client['type'] })}><option value="company">公司</option><option value="individual">個人</option></select></Field>
        <Field label="客戶／公司顯示名稱"><input className={inputClass} value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} /></Field>
        <Field label="公司名稱"><input className={inputClass} value={newClient.companyName || ''} onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })} /></Field>
        <Field label="統一編號"><input className={inputClass} value={newClient.taxId || ''} onChange={(e) => setNewClient({ ...newClient, taxId: e.target.value })} /></Field>
        <Field label="聯絡人"><input className={inputClass} value={newClient.contactName} onChange={(e) => setNewClient({ ...newClient, contactName: e.target.value })} /></Field>
        <Field label="Email"><input type="email" className={inputClass} value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} /></Field>
        <Field label="電話"><input className={inputClass} value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} /></Field>
        <Field label="LINE ID"><input className={inputClass} value={newClient.lineId} onChange={(e) => setNewClient({ ...newClient, lineId: e.target.value })} /></Field>
        <Field label="備註" full><textarea className={textareaClass} value={newClient.notes || ''} onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })} /></Field>
      </div><div className="mt-5 flex justify-end"><button disabled={busy} onClick={() => void saveClient()} className="flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-2 text-xs font-bold text-white"><Save size={14} />儲存客戶</button></div></div>}

      {section === 'quotes' && editingQuote && calculatedQuote && <div className="glass-card rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-5 md:p-7">
        <div className="mb-5 flex items-center justify-between"><div><h3 className="font-bold">{editingQuote.id ? `編輯 ${editingQuote.quoteNumber}` : '建立新報價單'}</h3><p className="mt-1 text-[10px] text-[var(--text-secondary)]">客戶連結 Token：{editingQuote.publicToken.slice(0, 8)}…</p></div><button onClick={() => setEditingQuote(null)}><X size={18} /></button></div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="報價單編號"><input className={inputClass} value={editingQuote.quoteNumber} onChange={(e) => setEditingQuote({ ...editingQuote, quoteNumber: e.target.value })} /></Field>
          <Field label="客戶"><select className={inputClass} value={editingQuote.clientId} onChange={(e) => setEditingQuote({ ...editingQuote, clientId: e.target.value })}><option value="">請選擇客戶</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name} — {client.contactName}</option>)}</select></Field>
          <Field label="中文專案名稱"><input className={inputClass} value={editingQuote.customTitleZh} onChange={(e) => setEditingQuote({ ...editingQuote, customTitleZh: e.target.value })} /></Field>
          <Field label="英文專案名稱"><input className={inputClass} value={editingQuote.customTitleEn} onChange={(e) => setEditingQuote({ ...editingQuote, customTitleEn: e.target.value })} /></Field>
          <Field label="合約範本"><select className={inputClass} value={editingQuote.contractTemplateId || ''} onChange={(e) => setEditingQuote({ ...editingQuote, contractTemplateId: e.target.value || undefined })}><option value="">自動選擇啟用範本</option>{templates.filter((item) => item.status === 'active').map((item) => <option key={item.id} value={item.id}>{item.nameZh}</option>)}</select></Field>
          <Field label="報價有效期限"><input type="date" className={inputClass} value={(editingQuote.validUntil || '').slice(0, 10)} onChange={(e) => setEditingQuote({ ...editingQuote, validUntil: e.target.value })} /></Field>
        </div>

        <div className="mt-6 rounded-md border border-[var(--border)] p-4">
          <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><h4 className="text-sm font-bold">報價項目</h4><div className="flex gap-2"><select className={inputClass} value={catalogSelection} onChange={(e) => setCatalogSelection(e.target.value)}><option value="">從服務／方案加入</option><optgroup label="服務">{services.map((item) => <option key={item.id} value={`service:${item.id}`}>{item.titleZh} — NT$ {Number(item.basePrice).toLocaleString()}</option>)}</optgroup><optgroup label="方案">{plans.map((item) => <option key={item.id} value={`plan:${item.id}`}>{item.nameZh} — NT$ {Number(item.basePrice).toLocaleString()}</option>)}</optgroup></select><button onClick={addCatalogItem} className="shrink-0 rounded-md border border-[var(--border)] px-3 text-xs font-semibold">加入</button><button onClick={() => setEditingQuote({ ...editingQuote, lineItems: [...editingQuote.lineItems, emptyLineItem()] })} className="shrink-0 rounded-md border border-[var(--border)] px-3 text-xs font-semibold">自訂項目</button></div></div>
          <div className="space-y-3">{calculatedQuote.lineItems.map((item, index) => <div key={item.id || index} className="grid gap-2 rounded-md bg-[var(--border-subtle)]/50 p-3 md:grid-cols-12"><input className={`${inputClass} md:col-span-3`} placeholder="中文項目" value={item.titleZh} onChange={(e) => updateLine(index, { titleZh: e.target.value })} /><input className={`${inputClass} md:col-span-3`} placeholder="英文項目" value={item.titleEn} onChange={(e) => updateLine(index, { titleEn: e.target.value })} /><input type="number" min="1" className={`${inputClass} md:col-span-1`} value={item.quantity} onChange={(e) => updateLine(index, { quantity: Number(e.target.value) })} /><input type="number" min="0" className={`${inputClass} md:col-span-2`} value={item.unitPrice} onChange={(e) => updateLine(index, { unitPrice: Number(e.target.value) })} /><div className="flex items-center justify-end text-xs font-bold md:col-span-2">NT$ {item.amount.toLocaleString()}</div><button onClick={() => setEditingQuote(recalculate({ ...editingQuote, lineItems: editingQuote.lineItems.filter((_, itemIndex) => itemIndex !== index) }))} className="flex items-center justify-center text-red-400 md:col-span-1"><Trash2 size={15} /></button><textarea className={`${textareaClass} min-h-16 md:col-span-6`} placeholder="中文說明" value={item.descriptionZh} onChange={(e) => updateLine(index, { descriptionZh: e.target.value })} /><textarea className={`${textareaClass} min-h-16 md:col-span-6`} placeholder="英文說明" value={item.descriptionEn} onChange={(e) => updateLine(index, { descriptionEn: e.target.value })} /></div>)}</div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="折扣金額"><input type="number" min="0" className={inputClass} value={editingQuote.discount} onChange={(e) => setEditingQuote(recalculate({ ...editingQuote, discount: Number(e.target.value) }))} /></Field>
          <Field label="稅額"><input type="number" min="0" className={inputClass} value={editingQuote.tax} onChange={(e) => setEditingQuote(recalculate({ ...editingQuote, tax: Number(e.target.value) }))} /></Field>
          <Field label="訂金比例 %"><input type="number" min="0" max="100" className={inputClass} value={editingQuote.depositPercent} onChange={(e) => setEditingQuote(recalculate({ ...editingQuote, depositPercent: Number(e.target.value) }))} /></Field>
          <Field label="狀態"><select className={inputClass} value={editingQuote.status} onChange={(e) => setEditingQuote({ ...editingQuote, status: e.target.value as Quote['status'] })}><option value="draft">草稿</option><option value="sent">已寄送</option><option value="viewed">已查看</option><option value="accepted">已接受</option><option value="rejected">已拒絕</option><option value="expired">已過期</option></select></Field>
          <Field label="中文備註" full><textarea className={textareaClass} value={editingQuote.notesZh} onChange={(e) => setEditingQuote({ ...editingQuote, notesZh: e.target.value })} /></Field>
          <Field label="中文交易條款" full><textarea className={textareaClass} value={editingQuote.termsZh} onChange={(e) => setEditingQuote({ ...editingQuote, termsZh: e.target.value })} /></Field>
        </div>
        <div className="mt-5 grid gap-3 rounded-md border border-[var(--border)] p-4 text-sm md:grid-cols-4"><div><span className="block text-[10px] text-[var(--text-secondary)]">小計</span>NT$ {calculatedQuote.subtotal.toLocaleString()}</div><div><span className="block text-[10px] text-[var(--text-secondary)]">總計</span><strong>NT$ {calculatedQuote.total.toLocaleString()}</strong></div><div><span className="block text-[10px] text-[var(--text-secondary)]">訂金</span>NT$ {calculatedQuote.depositAmount.toLocaleString()}</div><div><span className="block text-[10px] text-[var(--text-secondary)]">尾款</span>NT$ {calculatedQuote.balanceAmount.toLocaleString()}</div></div>
        <div className="mt-6 flex flex-wrap justify-end gap-2"><button onClick={() => setEditingQuote(null)} className="rounded-md border border-[var(--border)] px-4 py-2 text-xs font-semibold">取消</button><button disabled={busy} onClick={() => void saveQuote()} className="flex items-center gap-2 rounded-md border border-[var(--accent)] px-4 py-2 text-xs font-bold text-[var(--accent)]"><Save size={14} />儲存草稿</button><button disabled={busy} onClick={() => void saveQuote('sent')} className="flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white"><Send size={14} />發布報價</button></div>
      </div>}

      {section === 'quotes' && <div className="grid gap-3">{quotes.map((quote) => { const client = clients.find((item) => item.id === quote.clientId); const contract = contracts.find((item) => item.quoteId === quote.id); return <div key={quote.id} className="glass-card rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><strong>{quote.quoteNumber}</strong><span className="rounded-full bg-[var(--border-subtle)] px-2 py-0.5 text-[10px]">{statusLabel(quote.status)}</span>{contract && <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">已有合約</span>}</div><h3 className="mt-1 font-bold">{quote.customTitleZh}</h3><p className="mt-1 text-xs text-[var(--text-secondary)]">{client?.name || '未指定客戶'} · NT$ {Number(quote.total).toLocaleString()} · 有效至 {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('zh-TW') : '-'}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => void copyLink(quote.publicToken)} className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-2 text-xs"><Clipboard size={13} />複製連結</button><a href={`/client/${quote.publicToken}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-2 text-xs"><ExternalLink size={13} />預覽</a>{!contract && <button disabled={busy} onClick={() => void createContract(quote)} className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-2 text-xs"><FileSignature size={13} />建立合約</button>}<button onClick={() => setEditingQuote({ ...quote, lineItems: quote.lineItems.map((item) => ({ ...item })) })} className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-2 text-xs"><Pencil size={13} />編輯</button><button onClick={async () => { if (confirm(`確定刪除 ${quote.quoteNumber}？`)) { await repo.deleteQuote(quote.id); await load(); } }} className="flex items-center gap-1.5 rounded-md border border-red-500/20 px-3 py-2 text-xs text-red-400"><Trash2 size={13} />刪除</button></div></div></div>; })}</div>}

      {section === 'contracts' && <>
        {editingContract && <div className="glass-card rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-5 md:p-7"><div className="mb-5 flex items-center justify-between"><h3 className="font-bold">編輯合約 {editingContract.contractNumber}</h3><button onClick={() => setEditingContract(null)}><X size={18} /></button></div><div className="grid gap-4 md:grid-cols-2"><Field label="專案名稱"><input className={inputClass} value={editingContract.projectName} onChange={(e) => setEditingContract({ ...editingContract, projectName: e.target.value })} /></Field><Field label="狀態"><select className={inputClass} value={editingContract.status} onChange={(e) => setEditingContract({ ...editingContract, status: e.target.value as Contract['status'] })}><option value="draft">草稿</option><option value="sent">已寄送</option><option value="viewed">已查看</option><option value="signed">已簽署</option><option value="active">執行中</option><option value="completed">已完成</option><option value="cancelled">已取消</option></select></Field><Field label="中文合約 HTML" full hint="可使用基本 HTML 標籤"><textarea className={`${textareaClass} min-h-[360px] font-mono text-xs`} value={editingContract.contentZh} onChange={(e) => setEditingContract({ ...editingContract, contentZh: e.target.value })} /></Field><Field label="英文合約 HTML" full><textarea className={`${textareaClass} min-h-[260px] font-mono text-xs`} value={editingContract.contentEn} onChange={(e) => setEditingContract({ ...editingContract, contentEn: e.target.value })} /></Field></div><div className="mt-5 flex justify-end"><button disabled={busy} onClick={() => void saveContract()} className="flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-2 text-xs font-bold text-white"><Save size={14} />儲存合約</button></div></div>}

        {editingTemplate && <div className="glass-card rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-5 md:p-7"><div className="mb-5 flex items-center justify-between"><h3 className="font-bold">{editingTemplate.id ? '編輯合約範本' : '新增合約範本'}</h3><button onClick={() => setEditingTemplate(null)}><X size={18} /></button></div><div className="grid gap-4 md:grid-cols-2"><Field label="中文名稱"><input className={inputClass} value={editingTemplate.nameZh} onChange={(e) => setEditingTemplate({ ...editingTemplate, nameZh: e.target.value })} /></Field><Field label="英文名稱"><input className={inputClass} value={editingTemplate.nameEn} onChange={(e) => setEditingTemplate({ ...editingTemplate, nameEn: e.target.value })} /></Field><Field label="分類"><input className={inputClass} value={editingTemplate.category} onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })} /></Field><Field label="狀態"><select className={inputClass} value={editingTemplate.status} onChange={(e) => setEditingTemplate({ ...editingTemplate, status: e.target.value as ContractTemplate['status'] })}><option value="active">啟用</option><option value="inactive">停用</option></select></Field><Field label="中文範本 HTML" full hint="支援 {{clientName}}、{{projectNameZh}}、{{serviceScopeZh}}、{{totalAmount}} 等變數"><textarea className={`${textareaClass} min-h-[360px] font-mono text-xs`} value={editingTemplate.contentZh} onChange={(e) => setEditingTemplate({ ...editingTemplate, contentZh: e.target.value })} /></Field><Field label="英文範本 HTML" full><textarea className={`${textareaClass} min-h-[260px] font-mono text-xs`} value={editingTemplate.contentEn} onChange={(e) => setEditingTemplate({ ...editingTemplate, contentEn: e.target.value })} /></Field></div><div className="mt-5 flex justify-end"><button disabled={busy} onClick={() => void saveTemplate()} className="flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-2 text-xs font-bold text-white"><Save size={14} />儲存範本</button></div></div>}

        <div className="grid gap-3">{contracts.map((contract) => { const client = clients.find((item) => item.id === contract.clientId); return <div key={contract.id} className="glass-card rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex items-center gap-2"><strong>{contract.contractNumber}</strong><span className="rounded-full bg-[var(--border-subtle)] px-2 py-0.5 text-[10px]">{statusLabel(contract.status)}</span></div><h3 className="mt-1 font-bold">{contract.projectName}</h3><p className="mt-1 text-xs text-[var(--text-secondary)]">{client?.name || '未指定客戶'} · NT$ {Number(contract.amount).toLocaleString()}{contract.signedAt ? ` · 簽署於 ${new Date(contract.signedAt).toLocaleString('zh-TW')}` : ''}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => void copyLink(contract.publicToken)} className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-2 text-xs"><Link2 size={13} />複製簽署連結</button><a href={`/client/${contract.publicToken}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-2 text-xs"><ExternalLink size={13} />預覽</a><button onClick={() => setEditingContract({ ...contract })} className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-2 text-xs"><Pencil size={13} />編輯</button><button onClick={async () => { if (confirm(`確定刪除 ${contract.contractNumber}？`)) { await repo.deleteContract(contract.id); await load(); } }} className="flex items-center gap-1.5 rounded-md border border-red-500/20 px-3 py-2 text-xs text-red-400"><Trash2 size={13} />刪除</button></div></div></div>; })}</div>

        <div className="mt-8"><h3 className="mb-3 text-sm font-bold">合約範本</h3><div className="grid gap-3 md:grid-cols-2">{templates.map((template) => <div key={template.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4"><div className="flex items-start justify-between gap-3"><div><strong>{template.nameZh}</strong><p className="mt-1 text-xs text-[var(--text-secondary)]">{template.category} · v{template.version} · {template.status === 'active' ? '啟用' : '停用'}</p></div><div className="flex gap-2"><button onClick={() => setEditingTemplate({ ...template })} className="rounded-md border border-[var(--border)] p-2"><Pencil size={13} /></button><button onClick={async () => { if (confirm(`確定刪除 ${template.nameZh}？`)) { await repo.deleteContractTemplate(template.id); await load(); } }} className="rounded-md border border-red-500/20 p-2 text-red-400"><Trash2 size={13} /></button></div></div></div>)}</div></div>
      </>}
    </div>
  );
}

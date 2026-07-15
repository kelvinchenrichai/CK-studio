import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, ArrowRight, Check, CheckCircle2, FileSignature, FileText,
  Loader2, Lock, ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { repository } from '../../lib/repositories';
import { PublicWorkspace } from '../../types';

interface ClientWorkspaceProps {
  token?: string;
  onNavigate: (path: string) => void;
}

const money = (value?: number) => `NT$ ${Number(value || 0).toLocaleString('zh-TW')}`;

export default function ClientWorkspace({ token = '', onNavigate }: ClientWorkspaceProps) {
  const { lang } = useLanguage();
  const [tokenInput, setTokenInput] = useState('');
  const [workspace, setWorkspace] = useState<PublicWorkspace | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [consent, setConsent] = useState(false);

  const repo = repository as any;
  const quote = workspace?.quote ?? null;
  const contract = workspace?.contract ?? null;
  const client = workspace?.client ?? null;

  const load = async (publicToken: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await repo.getPublicWorkspace(publicToken);
      if (!data) throw new Error(lang === 'zh' ? '連結不存在、已失效或 Token 不正確。' : 'This link is invalid or expired.');
      setWorkspace(data);
      if (data.contract?.signatureName) setSignatureName(data.contract.signatureName);
    } catch (loadError: any) {
      setWorkspace(null);
      setError(loadError?.message || (lang === 'zh' ? '無法載入客戶文件。' : 'Unable to load client documents.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) void load(token);
  }, [token]);

  const quoteExpired = useMemo(() => quote?.validUntil ? new Date(quote.validUntil).getTime() < Date.now() : false, [quote?.validUntil]);
  const quoteAccepted = Boolean(contract || quote?.status === 'accepted' || quote?.status === 'converted_to_contract');
  const contractSigned = contract?.status === 'signed' || contract?.status === 'deposit_paid' || contract?.status === 'paid' || contract?.status === 'active' || contract?.status === 'completed';

  const acceptQuote = async () => {
    if (!token || !quote) return;
    setBusy(true);
    try {
      const updated = await repo.acceptPublicQuote(token);
      setWorkspace(updated);
    } catch (acceptError: any) {
      alert(acceptError?.message || (lang === 'zh' ? '報價接受失敗，請聯絡 CK Studio。' : 'Could not accept the quote.'));
    } finally { setBusy(false); }
  };

  const signContract = async () => {
    if (!token || !contract || !consent || signatureName.trim().length < 2) {
      alert(lang === 'zh' ? '請勾選同意並輸入完整簽署姓名。' : 'Please consent and enter your full legal name.');
      return;
    }
    setBusy(true);
    try {
      const updated = await repo.signPublicContract(token, signatureName.trim());
      setWorkspace(updated);
    } catch (signError: any) {
      alert(signError?.message || (lang === 'zh' ? '合約簽署失敗，請聯絡 CK Studio。' : 'Could not sign the contract.'));
    } finally { setBusy(false); }
  };

  if (!token) {
    return (
      <div className="relative flex min-h-[72vh] items-center justify-center overflow-hidden bg-[var(--bg)] px-6 text-[var(--text-primary)]">
        <div className="ambient-glow" /><div className="grid-bg" />
        <form onSubmit={(event) => { event.preventDefault(); if (tokenInput.trim()) onNavigate(`/client/${tokenInput.trim()}`); }} className="glass-card relative z-10 w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-7">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]"><Lock size={20} /></div>
          <h1 className="mt-5 text-center text-xl font-bold">{lang === 'zh' ? '客戶專屬文件空間' : 'Client document room'}</h1>
          <p className="mt-2 text-center text-xs leading-6 text-[var(--text-secondary)]">{lang === 'zh' ? '請輸入 CK Studio 提供的安全 Token，或直接使用報價／合約連結。' : 'Enter the secure token provided by CK Studio.'}</p>
          <input value={tokenInput} onChange={(event) => setTokenInput(event.target.value)} className="mt-6 w-full rounded-md border border-[var(--border)] bg-[var(--border-subtle)] px-3 py-3 text-sm outline-none focus:border-[var(--accent)]" placeholder="Secure token" />
          <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-bold text-white">{lang === 'zh' ? '開啟文件' : 'Open documents'}<ArrowRight size={15} /></button>
        </form>
      </div>
    );
  }

  if (loading) return <div className="flex min-h-[70vh] items-center justify-center bg-[var(--bg)] text-[var(--text-secondary)]"><Loader2 className="mr-2 animate-spin" size={18} />{lang === 'zh' ? '載入安全文件…' : 'Loading secure documents…'}</div>;

  if (error || !workspace) {
    return <div className="flex min-h-[70vh] items-center justify-center bg-[var(--bg)] px-6"><div className="max-w-md rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400"><AlertCircle className="mx-auto" /><h1 className="mt-3 font-bold">{lang === 'zh' ? '無法開啟文件' : 'Document unavailable'}</h1><p className="mt-2 text-xs leading-6">{error}</p></div></div>;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] px-5 py-10 text-[var(--text-primary)] sm:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="glass-card rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]"><ShieldCheck size={14} />CK Studio Secure Room</div><h1 className="mt-3 text-2xl font-extrabold">{quote?.customTitleZh || contract?.projectName}</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">{client?.companyName || client?.name} · {client?.contactName}</p></div><img src="/ck-logo.png" alt="CK Studio" className="h-16 w-24 rounded-md bg-white object-contain p-2" /></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3"><div className={`rounded-md border p-3 ${quoteAccepted ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-[var(--accent)]/30 bg-[var(--accent)]/10'}`}><span className="text-[10px] text-[var(--text-secondary)]">01</span><strong className="mt-1 block text-sm">{lang === 'zh' ? '確認報價' : 'Quote'}</strong></div><div className={`rounded-md border p-3 ${contractSigned ? 'border-emerald-500/30 bg-emerald-500/10' : contract ? 'border-[var(--accent)]/30 bg-[var(--accent)]/10' : 'border-[var(--border)] opacity-50'}`}><span className="text-[10px] text-[var(--text-secondary)]">02</span><strong className="mt-1 block text-sm">{lang === 'zh' ? '電子簽約' : 'Contract'}</strong></div><div className={`rounded-md border p-3 ${contractSigned ? 'border-[var(--accent)]/30 bg-[var(--accent)]/10' : 'border-[var(--border)] opacity-50'}`}><span className="text-[10px] text-[var(--text-secondary)]">03</span><strong className="mt-1 block text-sm">{lang === 'zh' ? '付款與開案' : 'Payment'}</strong></div></div>
        </header>

        {quote && <section className="glass-card rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 sm:p-8"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2 text-xs font-bold text-[var(--accent)]"><FileText size={15} />{lang === 'zh' ? '專案報價單' : 'Project quotation'}</div><h2 className="mt-2 text-xl font-bold">{quote.customTitleZh}</h2><p className="mt-1 text-xs text-[var(--text-secondary)]">{quote.quoteNumber} · {lang === 'zh' ? '有效期限' : 'Valid until'}：{quote.validUntil ? new Date(quote.validUntil).toLocaleDateString(lang === 'zh' ? 'zh-TW' : 'en-US') : '-'}</p></div><div className="text-right"><span className="text-[10px] text-[var(--text-secondary)]">{lang === 'zh' ? '專案總額' : 'Total'}</span><strong className="block text-2xl">{money(quote.total)}</strong></div></div>
          <div className="mt-6 overflow-hidden rounded-lg border border-[var(--border)]"><div className="grid grid-cols-[1fr_70px_120px] bg-[var(--border-subtle)] px-4 py-3 text-[10px] font-bold text-[var(--text-secondary)]"><span>{lang === 'zh' ? '項目' : 'Item'}</span><span className="text-center">QTY</span><span className="text-right">{lang === 'zh' ? '金額' : 'Amount'}</span></div>{quote.lineItems.map((item) => <div key={item.id} className="grid grid-cols-[1fr_70px_120px] border-t border-[var(--border)] px-4 py-4 text-sm"><div><strong>{lang === 'zh' ? item.titleZh : item.titleEn}</strong>{(lang === 'zh' ? item.descriptionZh : item.descriptionEn) && <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{lang === 'zh' ? item.descriptionZh : item.descriptionEn}</p>}</div><span className="text-center">{item.quantity}</span><span className="text-right font-semibold">{money(item.amount)}</span></div>)}</div>
          <div className="ml-auto mt-5 max-w-sm space-y-2 text-sm"><div className="flex justify-between text-[var(--text-secondary)]"><span>{lang === 'zh' ? '小計' : 'Subtotal'}</span><span>{money(quote.subtotal)}</span></div>{quote.discount > 0 && <div className="flex justify-between text-[var(--text-secondary)]"><span>{lang === 'zh' ? '折扣' : 'Discount'}</span><span>- {money(quote.discount)}</span></div>}{quote.tax > 0 && <div className="flex justify-between text-[var(--text-secondary)]"><span>{lang === 'zh' ? '稅額' : 'Tax'}</span><span>{money(quote.tax)}</span></div>}<div className="flex justify-between border-t border-[var(--border)] pt-3 text-base font-bold"><span>{lang === 'zh' ? '總計' : 'Total'}</span><span>{money(quote.total)}</span></div><div className="flex justify-between text-xs text-[var(--text-secondary)]"><span>{lang === 'zh' ? `訂金 ${quote.depositPercent}%` : `Deposit ${quote.depositPercent}%`}</span><span>{money(quote.depositAmount)}</span></div></div>
          {quote.notesZh && <div className="mt-6 rounded-md bg-[var(--border-subtle)] p-4 text-xs leading-6 text-[var(--text-secondary)] whitespace-pre-line">{lang === 'zh' ? quote.notesZh : quote.notesEn || quote.notesZh}</div>}
          {quote.termsZh && <div className="mt-4 text-[11px] leading-6 text-[var(--text-secondary)] whitespace-pre-line"><strong className="text-[var(--text-primary)]">{lang === 'zh' ? '交易條款：' : 'Terms: '}</strong>{lang === 'zh' ? quote.termsZh : quote.termsEn || quote.termsZh}</div>}
          {!quoteAccepted && <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-[var(--text-secondary)]">{quoteExpired ? (lang === 'zh' ? '此報價單已超過有效期限，請聯絡 CK Studio 更新。' : 'This quote has expired.') : (lang === 'zh' ? '點擊接受後，系統將產生正式合約供你確認與簽署。' : 'Accepting creates the agreement for signature.')}</p><button disabled={busy || quoteExpired || !['sent', 'viewed'].includes(quote.status)} onClick={() => void acceptQuote()} className="flex shrink-0 items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}{lang === 'zh' ? '接受此報價' : 'Accept quote'}</button></div>}
          {quoteAccepted && <div className="mt-6 flex items-center gap-2 rounded-md border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-400"><CheckCircle2 size={17} />{lang === 'zh' ? '此報價已接受。請繼續確認下方合約。' : 'Quote accepted. Please review the agreement below.'}</div>}
        </section>}

        {contract && <section className="glass-card rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 sm:p-8"><div className="flex items-center gap-2 text-xs font-bold text-[var(--accent)]"><FileSignature size={15} />{lang === 'zh' ? '正式服務合約' : 'Service agreement'}</div><div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-xl font-bold">{contract.projectName}</h2><p className="mt-1 text-xs text-[var(--text-secondary)]">{contract.contractNumber}</p></div>{contractSigned && <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">{lang === 'zh' ? '已完成簽署' : 'Signed'}</span>}</div>
          <article className="prose prose-sm mt-6 max-w-none rounded-lg border border-[var(--border)] bg-white p-5 text-gray-800 sm:p-8" dangerouslySetInnerHTML={{ __html: lang === 'zh' ? contract.contentZh : contract.contentEn || contract.contentZh }} />
          {!contractSigned ? <div className="mt-6 space-y-4 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-5"><label className="flex cursor-pointer items-start gap-3 text-sm"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1" /><span>{lang === 'zh' ? '我已完整閱讀並同意上述合約內容，並同意以電子方式完成簽署。' : 'I have read and agree to this contract and consent to electronic signature.'}</span></label><label className="block"><span className="mb-2 block text-xs font-bold text-[var(--text-secondary)]">{lang === 'zh' ? '簽署人完整姓名' : 'Full legal name'}</span><input value={signatureName} onChange={(event) => setSignatureName(event.target.value)} className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-3 text-sm outline-none focus:border-[var(--accent)]" placeholder={lang === 'zh' ? '請輸入真實姓名' : 'Enter your legal name'} /></label><button disabled={busy || !consent || signatureName.trim().length < 2} onClick={() => void signContract()} className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? <Loader2 size={15} className="animate-spin" /> : <FileSignature size={15} />}{lang === 'zh' ? '確認並電子簽署' : 'Sign agreement'}</button></div> : <div className="mt-6 rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-5"><div className="flex items-center gap-2 font-bold text-emerald-400"><CheckCircle2 size={18} />{lang === 'zh' ? '合約簽署完成' : 'Agreement signed'}</div><p className="mt-2 text-xs leading-6 text-[var(--text-secondary)]">{lang === 'zh' ? `簽署人：${contract.signatureName}｜簽署時間：${contract.signedAt ? new Date(contract.signedAt).toLocaleString('zh-TW') : '-'}` : `Signed by ${contract.signatureName}`}</p></div>}
        </section>}

        {contractSigned && <section className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-6 text-center"><CheckCircle2 className="mx-auto text-[var(--accent)]" size={30} /><h2 className="mt-3 text-lg font-bold">{lang === 'zh' ? '文件流程已完成' : 'Documents completed'}</h2><p className="mx-auto mt-2 max-w-xl text-xs leading-6 text-[var(--text-secondary)]">{lang === 'zh' ? 'CK Studio 將確認簽署紀錄並提供付款／開案資訊。Stripe 付款會在下一階段正式啟用。' : 'CK Studio will verify the signature and provide payment and onboarding details.'}</p></section>}
      </div>
    </div>
  );
}

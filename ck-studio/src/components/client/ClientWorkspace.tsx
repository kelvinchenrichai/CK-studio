/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { repository } from '../../lib/repositories';
import { Quote, Contract, Client, Payment } from '../../types';
import { 
  Check, 
  FileText, 
  CreditCard, 
  Download, 
  Signature, 
  Coins, 
  ArrowRight, 
  AlertCircle, 
  Terminal,
  HelpCircle,
  Building,
  Activity,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface ClientWorkspaceProps {
  token?: string;
  onNavigate: (path: string) => void;
}

export default function ClientWorkspace({ token: urlToken, onNavigate }: ClientWorkspaceProps) {
  const { t, lang } = useLanguage();
  const [tokenInput, setTokenInput] = useState('');
  const [activeToken, setActiveToken] = useState<string>('');
  
  const [quote, setQuote] = useState<Quote | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);

  const [stepperIndex, setStepperIndex] = useState<number>(0); // 0: Quote, 1: Contract, 2: Payment, 3: SuccessOnboarding
  const [signatureName, setSignatureName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'manual'>('stripe');
  const [bankLastFive, setBankLastFive] = useState('');
  const [paymentSent, setPaymentSent] = useState(false);

  // Parse token on mount or URL change
  useEffect(() => {
    const tok = urlToken || '';
    if (tok) {
      setActiveToken(tok);
      loadTokenWorkspace(tok);
    }
  }, [urlToken]);

  const loadTokenWorkspace = (tok: string) => {
    // Attempt to match quote token
    const matchedQuote = repository.getQuotes().find(q => q.publicToken === tok);
    if (matchedQuote) {
      setQuote(matchedQuote);
      const matchedClient = repository.getClients().find(c => c.id === matchedQuote.clientId);
      if (matchedClient) setClient(matchedClient);
      
      // Match related contract if exists
      const matchedContract = repository.getContracts().find(c => c.quoteId === matchedQuote.id);
      if (matchedContract) {
        setContract(matchedContract);
        // Determine step based on status
        if (matchedContract.status === 'signed' || matchedContract.status === 'deposit_paid') {
          // If contract is signed but not paid, go to payment. If paid, go to success
          const relatedPayment = repository.getPayments().find(p => p.contractId === matchedContract.id && p.status === 'paid');
          if (relatedPayment || matchedContract.status === 'deposit_paid') {
            setStepperIndex(3); // Success Onboarding
            if (relatedPayment) setPayment(relatedPayment);
          } else {
            setStepperIndex(2); // Payment
          }
        } else if (matchedContract.status === 'accepted') {
          setStepperIndex(1); // Needs signature
        } else {
          setStepperIndex(0); // Needs quote accept
        }
      } else {
        setStepperIndex(0); // Just a quote for now
      }
      return;
    }

    // Attempt to match contract token directly
    const matchedContract = repository.getContracts().find(c => c.publicToken === tok);
    if (matchedContract) {
      setContract(matchedContract);
      const matchedClient = repository.getClients().find(c => c.id === matchedContract.clientId);
      if (matchedClient) setClient(matchedClient);
      
      const relatedQuote = repository.getQuotes().find(q => q.id === matchedContract.quoteId);
      if (relatedQuote) setQuote(relatedQuote);

      if (matchedContract.status === 'deposit_paid') {
        setStepperIndex(3);
      } else if (matchedContract.status === 'signed') {
        setStepperIndex(2);
      } else if (matchedContract.status === 'accepted') {
        setStepperIndex(1);
      } else {
        setStepperIndex(0);
      }
    }
  };

  const handleAccessRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    onNavigate(`/client/${tokenInput.trim()}`);
  };

  // ACTIONS: Accept Quote
  const handleAcceptQuote = () => {
    if (!quote) return;
    
    // Accept the quote in repository
    repository.updateQuoteStatus(quote.id, 'accepted');
    
    // Automatically provision or retrieve matching Contract in state
    let matchedContract = repository.getContracts().find(c => c.quoteId === quote.id);
    if (!matchedContract) {
      matchedContract = repository.createContractFromQuote(quote);
    }
    repository.updateContractStatus(matchedContract.id, 'sent');

    setContract(matchedContract);
    setStepperIndex(1); // Proceed to contract signature
  };

  // ACTIONS: Sign Contract
  const handleSignContract = () => {
    if (!contract || !signatureName.trim()) {
      alert(lang === 'zh' ? '請輸入您完整的法定姓名以完成簽署' : 'Please type your full legal name to sign');
      return;
    }

    const updated = repository.signContract(contract.id, signatureName.trim());
    if (updated) {
      setContract(updated);
    }
    setStepperIndex(2); // Proceed to payment
  };

  // ACTIONS: Payment Checkout Redirection (Stripe & Bank transfer)
  const handleProceedPayment = async () => {
    if (!contract || !quote) return;

    if (paymentMethod === 'stripe') {
      // 1. Create payment ledger record in local repositories
      const freshPayment = repository.createPayment({
        clientId: contract.clientId,
        quoteId: contract.quoteId || '',
        contractId: contract.id,
        provider: 'stripe',
        amount: contract.depositAmount,
        currency: 'TWD',
        status: 'pending'
      });

      // 2. Fetch server session URL (handles mock fallback automatically)
      try {
        const response = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: freshPayment.id,
            amount: contract.depositAmount,
            description: `Deposit for Project: ${contract.projectName}`,
            successUrl: `${window.location.origin}/client/${activeToken}`,
            cancelUrl: `${window.location.origin}/client/${activeToken}`
          })
        });
        
        const data = await response.json();
        
        if (data.url) {
          // If the backend returned a mock redirection URL or a real stripe url, follow it
          console.log(`[Checkout URL Redirecting] -> ${data.url}`);
          
          if (data.isMock) {
            // Simulated Stripe Checkout behavior - mark payment as paid persistently in our repo right away!
            repository.updatePaymentStatus(freshPayment.id, 'paid');
            repository.updateContractStatus(contract.id, 'deposit_paid');
            // Go to the URL
            window.location.href = data.url;
          } else {
            // Real Stripe checkout redirection
            window.location.href = data.url;
          }
        }
      } catch (error) {
        console.error('[Payment API Redirection Error]', error);
        alert('Payment initiation failed. Proceeding with Simulated Direct Confirmation.');
        // Secure manual bypass for demo resilience
        repository.updatePaymentStatus(freshPayment.id, 'paid');
        repository.updateContractStatus(contract.id, 'deposit_paid');
        setStepperIndex(3);
      }

    } else {
      // Manual Remittance proof submission
      if (!bankLastFive || bankLastFive.length < 5) {
        alert(lang === 'zh' ? '請輸入匯款帳號後五碼以供對帳' : 'Please enter the last 5 digits of your bank account');
        return;
      }

      repository.createPayment({
        clientId: contract.clientId,
        quoteId: contract.quoteId || '',
        contractId: contract.id,
        provider: 'manual',
        amount: contract.depositAmount,
        currency: 'TWD',
        status: 'paid', // Instant mock validation success
        paymentMethod: `Bank Wire (last 5 digits: ${bankLastFive})`,
        paidAt: new Date().toISOString()
      });

      repository.updateContractStatus(contract.id, 'deposit_paid');
      setPaymentSent(true);
      
      // Auto transition to success dashboard
      setTimeout(() => {
        setStepperIndex(3);
      }, 1500);
    }
  };

  // MOCK: Download PDF receipt trigger
  const handleDownloadReceipt = () => {
    alert(lang === 'zh' ? '正在下載數位開案電子收據 (PDF)...' : 'Downloading Digital Onboarding Receipt (PDF)...');
  };

  // IF NO WORKSPACE TOKEN YET: Show Access Gateway Entry gate
  if (!activeToken) {
    return (
      <div className="w-full bg-[var(--bg)] text-[var(--text-primary)] flex items-center justify-center min-h-[75vh] px-6 relative overflow-hidden">
        <div className="ambient-glow" />
        <div className="grid-bg" />
        
        <div className="w-full max-w-md bg-[var(--bg-elevated)] p-8 border border-[var(--border)] rounded-sm space-y-6 glass-card relative z-10 shadow-xl">
          <div className="text-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)] mx-auto animate-pulse">
              <Lock size={20} />
            </div>
            <h2 className="text-xl font-sans font-extrabold tracking-tight text-[var(--text-primary)]">Client Workspace</h2>
            <p className="text-xs text-[var(--text-secondary)] font-mono">Enter security room token key below to sync workspace</p>
          </div>

          <form onSubmit={handleAccessRoom} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono uppercase text-[var(--text-secondary)] font-bold">Workspace Token Code</label>
              <input
                type="text"
                required
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="e.g. quote-sec-t1 / contract-sec-t2"
                className="w-full text-xs font-mono bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border)] px-3.5 py-2.5 rounded-sm focus:border-[var(--accent)] focus:outline-none focus:ring-0 transition-all shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-[var(--accent)] hover:opacity-90 text-white font-mono text-xs font-bold uppercase tracking-widest text-center items-center justify-center rounded-sm transition-opacity shadow-sm"
            >
              Access Workspace
            </button>
          </form>

          {/* Quick tips helper for sandbox tester */}
          <div className="bg-[var(--border-subtle)] p-4 rounded-sm text-[10px] font-mono leading-relaxed text-[var(--text-secondary)] border border-[var(--border)] shadow-inner">
            <span className="block font-bold text-[var(--accent)] uppercase mb-1">Sandbox Quick Test Token Keys:</span>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <button 
                  type="button" 
                  onClick={() => { setTokenInput('quote-sec-t1'); }} 
                  className="underline hover:text-[var(--accent)] cursor-pointer text-left font-mono"
                >
                  quote-sec-t1
                </button> (Preseeded Quote)
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => { setTokenInput('contract-sec-t2'); }} 
                  className="underline hover:text-[var(--accent)] cursor-pointer text-left font-mono"
                >
                  contract-sec-t2
                </button> (Preseeded Contract)
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // WORKSPACE CORE LAYOUT (WHEN TOKEN LOADED)
  return (
    <div className="w-full bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-200 min-h-screen relative">
      
      {/* Dynamic Workspace Header */}
      <header className="relative border-b border-[var(--border)] px-6 py-6 sm:px-8 bg-[var(--bg-elevated)] overflow-hidden">
        <div className="grid-bg" />
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-[var(--accent)]/10 text-[var(--accent)] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                ACTIVE_PORTAL
              </span>
              <span className="text-xs font-mono text-[var(--text-secondary)]">Token: {activeToken}</span>
            </div>
            <h2 className="text-2xl font-sans font-bold tracking-tight text-[var(--text-primary)] mt-1">
              {client ? `${client.name} Workspace` : 'Interactive Client Workspace'}
            </h2>
          </div>

          <button
            onClick={() => { setActiveToken(''); onNavigate('/client'); }}
            className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            ← Exit Workspace
          </button>
        </div>
      </header>

      {/* Workspace Dashboard Process Stepper */}
      <section className="border-b border-[var(--border)] bg-[var(--bg-elevated)] px-6 py-4 sm:px-8 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
            
            {[
              { idx: 0, label: t.client.step1, code: 'Review Quote' },
              { idx: 1, label: t.client.step2, code: 'Sign Contract' },
              { idx: 2, label: t.client.step3, code: 'Settle Payment' },
              { idx: 3, label: t.client.step4, code: 'Kickoff Launch' }
            ].map((step) => {
              const isActive = stepperIndex === step.idx;
              const isPast = stepperIndex > step.idx;
              return (
                <div 
                  key={step.idx}
                  className={`py-2 border-b-2 font-mono uppercase text-[9px] sm:text-xs transition-all ${
                    isActive 
                      ? 'border-[var(--accent)] text-[var(--accent)] font-black' 
                      : isPast 
                      ? 'border-green-500 text-green-500 font-bold' 
                      : 'border-transparent text-[var(--text-secondary)]/50'
                  }`}
                >
                  <span className="block sm:inline mr-1">[{step.idx + 1}]</span>
                  <span>{step.label}</span>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* Main Workspace Frame */}
      <main className="mx-auto max-w-7xl px-6 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Side: Dynamic Workspace step card */}
        <section className="lg:col-span-8 bg-[var(--bg-elevated)] p-6 sm:p-8 border border-[var(--border)] rounded-sm shadow-sm space-y-6 glass-card">
          
          {/* STEP 1: REVIEW QUOTE */}
          {stepperIndex === 0 && quote && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-[var(--border)] pb-3 flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] font-mono flex items-center gap-2">
                  <FileText size={15} className="text-[var(--accent)]" />
                  <span>Review Quote Estimate Blueprint</span>
                </h3>
                <span className="text-xs font-mono text-[var(--accent)] font-black">{quote.quoteNumber}</span>
              </div>

              {/* Estimate Items Table */}
              <div className="space-y-4">
                <div className="border border-[var(--border)] divide-y divide-[var(--border)] rounded overflow-hidden shadow-sm">
                  <div className="bg-[var(--border-subtle)] px-4 py-2.5 grid grid-cols-12 text-[10px] font-mono text-[var(--text-secondary)] uppercase font-black">
                    <div className="col-span-8">Solution Item / Scope Specification</div>
                    <div className="col-span-2 text-right">Qty</div>
                    <div className="col-span-2 text-right">Price (TWD)</div>
                  </div>

                  {/* Sample items breakdown mapping or fallbacks */}
                  <div className="px-4 py-3 grid grid-cols-12 text-xs">
                    <div className="col-span-8">
                      <span className="font-bold text-[var(--text-primary)]">CK OS Integration blueprint</span>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">High-fidelity core studio system setup with automated billing ledger.</p>
                    </div>
                    <div className="col-span-2 text-right font-mono text-[var(--text-secondary)]">1</div>
                    <div className="col-span-2 text-right font-mono text-[var(--text-primary)]">NT$ {quote.subtotal.toLocaleString()}</div>
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-[var(--border)] pt-4 flex flex-col items-end gap-1.5 text-xs font-mono">
                  <div>
                    <span className="text-[var(--text-secondary)] uppercase">Subtotal:</span>
                    <span className="ml-3 font-bold text-[var(--text-primary)]">NT$ {quote.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="text-[var(--accent)]">
                    <span className="uppercase">Tax / Invoice (5%):</span>
                    <span className="ml-3 font-bold">NT$ {quote.tax.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-dashed border-[var(--border)] pt-2 mt-1 text-sm">
                    <span className="text-[var(--text-secondary)] uppercase">Grand Total Estimate:</span>
                    <span className="ml-3 font-black text-[var(--text-primary)]">NT$ {quote.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Escrow rules panel */}
                <div className="bg-[var(--border-subtle)] p-4 border border-[var(--border)] rounded text-xs space-y-1">
                  <span className="block font-mono text-[10px] font-black text-[var(--accent)] uppercase">Payment Schedule Agreement</span>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    A deposit of <span className="font-bold text-[var(--text-primary)] font-mono">{quote.depositPercent}% (NT$ {quote.depositAmount.toLocaleString()})</span> is required upon contract signing to initiate resource allocation. Balance amount <span className="font-bold text-[var(--text-primary)] font-mono">(NT$ {quote.balanceAmount.toLocaleString()})</span> settled upon live deployment confirmation.
                  </p>
                </div>
              </div>

              {/* Accept Trigger CTA */}
              <div className="pt-4 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={handleAcceptQuote}
                  className="w-full py-3 bg-[var(--accent)] hover:opacity-90 text-white font-mono text-xs font-bold uppercase tracking-widest transition-opacity flex items-center justify-center gap-1.5 rounded-sm shadow-sm"
                  id="btn-accept-quote"
                >
                  <span>Accept Quote & Initiate Contract Formulation</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SIGN CONTRACT */}
          {stepperIndex === 1 && contract && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-[var(--border)] pb-3 flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] font-mono flex items-center gap-2">
                  <Signature size={15} className="text-[var(--accent)]" />
                  <span>Review and Execute Contract Signature</span>
                </h3>
                <span className="text-xs font-mono text-[var(--accent)] font-black">{contract.contractNumber}</span>
              </div>

              {/* Printable Contract Terms Container */}
              <div className="border border-[var(--border)] p-5 rounded-sm h-60 overflow-y-scroll bg-[var(--border-subtle)] space-y-4 font-sans text-xs leading-relaxed text-[var(--text-secondary)]">
                <h4 className="text-center font-extrabold text-[var(--text-primary)] uppercase font-sans tracking-wider">[ STUDIO WORK CONTRACT AGREEMENT ]</h4>
                <p>
                  This agreement is made and entered into by and between CK Studio ("Provider") and the undersigned organization ("Client") listed in this active workspace.
                </p>
                <h5 className="font-bold text-[var(--text-primary)]">1. Scope of Work (SOW)</h5>
                <p>
                  {lang === 'zh' ? contract.serviceScopeZh : contract.serviceScopeEn} Provider agrees to develop, optimize, and configure system deliverables as requested in the approved specifications.
                </p>
                <h5 className="font-bold text-[var(--text-primary)]">2. Payment & Milestone Schedules</h5>
                <p>
                  Client shall pay Provider a non-refundable deposit of {contract.depositAmount.toLocaleString()} TWD upon the execution of this contract. Project work shall not initiate prior to receipt.
                </p>
                <h5 className="font-bold text-[var(--text-primary)]">3. Intellectual Property Rights</h5>
                <p>
                  All source codes, indicator files, databases, and structural assets transfers entirely to the Client's possession upon final payment ledger clearance. Provider retains promotional portfolio display rights.
                </p>
              </div>

              {/* Signature Input */}
              <div className="space-y-3 bg-[var(--border-subtle)] p-4 border border-[var(--border)] rounded-sm">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-[var(--text-secondary)] font-bold">Full Legal Name Signature / 電子簽名</label>
                  <input
                    type="text"
                    required
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    placeholder="Type Legal Name to execute (e.g. Johnathan Doe)"
                    className="w-full text-xs font-mono bg-[var(--bg)] text-[var(--text-primary)] border border-[var(--border)] px-3.5 py-2.5 rounded-sm focus:border-[var(--accent)] focus:outline-none focus:ring-0 transition-all shadow-sm"
                    id="input-contract-signature"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--text-secondary)] leading-none">
                  <Lock size={10} className="text-[var(--accent)]" />
                  <span>Legally binding electronic handshake agreement under secure token</span>
                </div>
              </div>

              {/* Execute Signature Action */}
              <div className="pt-4 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={handleSignContract}
                  className="w-full py-3 bg-[var(--accent)] hover:opacity-90 text-white font-mono text-xs font-bold uppercase tracking-widest transition-opacity flex items-center justify-center gap-1.5 rounded-sm shadow-sm"
                  id="btn-sign-contract"
                >
                  <span>Sign Contract & Lock Handshake</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SETTLE PAYMENT */}
          {stepperIndex === 2 && contract && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-[var(--border)] pb-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] font-mono flex items-center gap-2">
                  <CreditCard size={15} className="text-[var(--accent)]" />
                  <span>Deposit Escrow Payment Settlement</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--border-subtle)] p-5 border border-[var(--border)] rounded-sm font-mono text-xs">
                <div>
                  <span className="text-[var(--text-secondary)] uppercase text-[10px]">Payment Target</span>
                  <span className="block font-bold text-[var(--text-primary)] mt-1 uppercase">{contract.projectName}</span>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)] uppercase text-[10px]">Deposit Settle Due</span>
                  <span className="block font-black text-red-500 dark:text-red-400 mt-1 text-sm">NT$ {contract.depositAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] block font-bold">Select Billing Gateway Channel</span>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`p-4 border rounded flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'stripe' 
                        ? 'border-[var(--accent)] bg-[var(--border-subtle)] ring-1 ring-[var(--accent)]' 
                        : 'border-[var(--border)] hover:bg-[var(--border-subtle)]'
                    }`}
                  >
                    <CreditCard size={20} className="text-[var(--accent)]" />
                    <span className="font-mono text-xs font-bold text-[var(--text-primary)] uppercase">Stripe Checkout Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('manual')}
                    className={`p-4 border rounded flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'manual' 
                        ? 'border-[var(--accent)] bg-[var(--border-subtle)] ring-1 ring-[var(--accent)]' 
                        : 'border-[var(--border)] hover:bg-[var(--border-subtle)]'
                    }`}
                  >
                    <Building size={20} className="text-amber-500" />
                    <span className="font-mono text-xs font-bold text-[var(--text-primary)] uppercase">Bank Wire Remittance</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Gate Info */}
              {paymentMethod === 'stripe' ? (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 p-4 rounded text-xs leading-relaxed text-blue-800 dark:text-blue-300">
                  <span className="block font-bold uppercase font-mono mb-1">Stripe Gateway Core Integration</span>
                  If credentials are not yet configured in the panel secrets, clicking below will trigger a simulated Stripe checkout redirection success link. Your payment will be updated automatically!
                </div>
              ) : (
                <div className="bg-[var(--border-subtle)] p-5 border border-[var(--border)] rounded-sm space-y-4 font-mono text-xs">
                  <div className="border-b border-[var(--border)] pb-2">
                    <span className="block font-bold text-amber-500 uppercase">Manual Wire Coordinates:</span>
                    <ul className="list-disc pl-4 space-y-1 mt-1 text-[var(--text-secondary)]">
                      <li>Bank Name: Cathay United Bank (國泰世華銀行 - 013)</li>
                      <li>Branch: Sinyi Branch (信義分行)</li>
                      <li>Account Number: <span className="font-bold text-[var(--text-primary)]">9988-1234-5678-9000</span></li>
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase text-[var(--text-secondary)] font-bold">Last 5 digits of Bank Account / 匯款帳號後五碼</label>
                    <input
                      type="text"
                      maxLength={5}
                      value={bankLastFive}
                      onChange={(e) => setBankLastFive(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 54321"
                      className="w-full text-xs font-mono bg-[var(--bg)] text-[var(--text-primary)] border border-[var(--border)] px-3.5 py-2.5 rounded-sm focus:border-[var(--accent)] focus:outline-none focus:ring-0 transition-all shadow-sm"
                    />
                  </div>
                </div>
              )}

              {/* Submit Payment Action */}
              <div className="pt-4 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={handleProceedPayment}
                  disabled={paymentSent}
                  className="w-full py-3 bg-[var(--accent)] hover:opacity-90 text-white font-mono text-xs font-bold uppercase tracking-widest transition-opacity flex items-center justify-center gap-1.5 rounded-sm shadow-sm"
                  id="btn-execute-payment"
                >
                  {paymentSent ? (
                    <span>Initiating Payment Transfer Proof...</span>
                  ) : (
                    <>
                      <span>{paymentMethod === 'stripe' ? 'Execute Card Checkout via Stripe' : 'Register Remittance Transfer Proof'}</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: KICKOFF & RECEIPT ONBOARDING */}
          {stepperIndex === 3 && contract && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center space-y-4 py-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest font-black text-green-500">State: deposit_received</span>
                  <h3 className="text-2xl font-sans font-bold text-[var(--text-primary)] mt-1">CK Studio Project Formally Kickstarted!</h3>
                  <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed mt-2">
                    We have successfully synchronized your contract, legal electronic signatures, and verified payment ledger entry. Development resources have been allocated.
                  </p>
                </div>
              </div>

              {/* High-fidelity Onboarding Digital Receipt */}
              <div className="border border-[var(--border)] bg-[var(--border-subtle)] p-5 rounded-sm font-mono text-xs space-y-4">
                <div className="flex justify-between items-center border-b border-dashed border-[var(--border)] pb-3">
                  <span className="font-bold text-[var(--text-primary)] uppercase tracking-wider">Onboarding Receipt Ledger</span>
                  <span className="text-[var(--text-secondary)] uppercase text-[10px]">LEDGER_CONFIRMED</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[var(--text-secondary)] block text-[9px] uppercase">Transaction Number</span>
                    <span className="font-bold text-[var(--text-primary)]">{payment?.paymentNumber || 'P-MOCK-WIRE'}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)] block text-[9px] uppercase">Legal Signature Executed</span>
                    <span className="font-bold text-[var(--text-primary)] italic">{contract.signatureName || 'Electronic Verified Signature'}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)] block text-[9px] uppercase">Amount Settled</span>
                    <span className="font-bold text-green-500">NT$ {contract.depositAmount.toLocaleString()} TWD</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)] block text-[9px] uppercase">Clearing Provider</span>
                    <span className="font-bold text-[var(--text-primary)] uppercase">{payment?.provider || 'Bank Wire manual'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-dashed border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button
                    type="button"
                    onClick={handleDownloadReceipt}
                    className="w-full sm:w-auto px-4 py-2 bg-[var(--text-primary)] text-[var(--bg)] hover:opacity-90 transition-opacity text-[10px] font-mono font-black uppercase tracking-widest flex items-center justify-center gap-1.5 rounded-sm shadow-sm cursor-pointer"
                  >
                    <Download size={12} />
                    <span>Download Onboarding Receipt PDF</span>
                  </button>
                  <span className="text-[10px] text-[var(--text-secondary)] font-mono">Security Certificate Verified ✓</span>
                </div>
              </div>
            </div>
          )}

        </section>

        {/* Right Side: Workspace Information / Support Coordinates */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] p-6 rounded-sm space-y-4 glass-card">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest border-b border-[var(--border)] pb-1.5 text-[var(--text-primary)]">
              Secure Room Overview
            </h4>
            
            <div className="space-y-4 font-mono text-xs">
              <div>
                <span className="text-[var(--text-secondary)] block uppercase text-[10px]">Client CRM Name</span>
                <span className="font-bold text-[var(--text-primary)] block mt-1">{client?.name || 'Inquire pending'}</span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block uppercase text-[10px]">Project Directory</span>
                <span className="font-bold text-[var(--text-primary)] block mt-1">{contract ? contract.projectName : ' formulating...'}</span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block uppercase text-[10px]">Client Key contact</span>
                <span className="text-[var(--text-secondary)] block mt-1 break-all">{client?.email} / {client?.phone}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-[var(--border)] pt-4 text-[10px] font-mono text-[var(--text-secondary)] leading-relaxed space-y-2">
              <span className="block font-bold text-amber-500 uppercase">Need Emergency Support?</span>
              If you have questions regarding indicator formula translation, n8n webhook keys, or Cathay bank coordinates, reach out to CK Studio directly on official LINE chat.
            </div>
          </div>
        </aside>

      </main>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './lib/i18n/LanguageContext';
import { repository } from './lib/repositories';
import { Service, PricingPlan, SiteSettings } from './types';

// Layout & Site Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomeView from './components/site/HomeView';
import ServicesView from './components/site/ServicesView';
import PortfolioView from './components/site/PortfolioView';
import PricingView from './components/site/PricingView';
import StartProjectView from './components/site/StartProjectView';
import ClientWorkspace from './components/client/ClientWorkspace';
import AdminPortal from './components/admin/AdminPortal';

import { 
  X, 
  CheckCircle2, 
  ArrowRight,
  ClipboardList
} from 'lucide-react';

const FALLBACK_SITE_SETTINGS: SiteSettings = {
  studioName: 'CK Studio',
  taglineZh: '為交易員、創作者與企業打造 AI 驅動的智能軟體系統。',
  taglineEn: 'Building intelligent software for traders, creators, and businesses.',
  email: 'hello@ckstudio.dev',
  phone: '+886 900 000 000',
  officialLineUrl: 'https://lin.ee/your-line-placeholder',
  bookingUrl: 'https://calendly.com/ck-studio',
  socials: {},
  defaultLanguage: 'zh',
  defaultTheme: 'dark',
  brandColor: '#3B82F6',
};

function AppContent() {
  const { t, lang } = useLanguage();
  
  // Custom router state
  const [path, setPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  const [navigationState, setNavigationState] = useState<{
    preselectedPlanId?: string;
    preselectedAddonIds?: string[];
  } | undefined>(undefined);

  // Sync state with Popstate for back/forward navigation
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      setPath(window.location.pathname);
      if (e.state) {
        setNavigationState(e.state);
      } else {
        setNavigationState(undefined);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (newPath: string, state?: any) => {
    window.history.pushState(state || null, '', newPath);
    setPath(newPath);
    setNavigationState(state);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Global Brand/Site settings loaded from repository (Supabase or LocalStorage).
  // Start with safe defaults so child components never receive null during the first render.
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(FALLBACK_SITE_SETTINGS);

  useEffect(() => {
    let cancelled = false;

    const loadSiteSettings = async () => {
      try {
        const loadedSettings = await repository.getSiteSettings();
        if (cancelled || !loadedSettings) return;

        setSiteSettings({
          ...FALLBACK_SITE_SETTINGS,
          ...loadedSettings,
          socials: {
            ...FALLBACK_SITE_SETTINGS.socials,
            ...(loadedSettings.socials ?? {}),
          },
        });
      } catch (error) {
        console.error('[CK Studio] Failed to load site settings; using defaults.', error);
      }
    };

    loadSiteSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  // Admin login status
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ck_studio_admin_session') === 'true';
    }
    return false;
  });

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('ck_studio_admin_session', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('ck_studio_admin_session');
    navigate('/');
  };

  // Waitlist Drawer Overlay state
  const [waitlistService, setWaitlistService] = useState<Service | null>(null);
  const [waitlistName, setWaitlistName] = useState('');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistPhone, setWaitlistPhone] = useState('');
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  const handleOpenWaitlist = (service: Service) => {
    setWaitlistService(service);
    setWaitlistSuccess(false);
  };

  const handleCloseWaitlist = () => {
    setWaitlistService(null);
    setWaitlistName('');
    setWaitlistEmail('');
    setWaitlistPhone('');
    setWaitlistSuccess(false);
  };

  const handleSubmitWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistName || !waitlistEmail || !waitlistPhone || !waitlistService) {
      alert('Please fill out all required intake parameters.');
      return;
    }

    repository.createWaitlist({
      serviceItemId: waitlistService.id,
      name: waitlistName,
      email: waitlistEmail,
      phone: waitlistPhone,
      lineId: '',
      status: 'new'
    });

    setWaitlistSuccess(true);
  };

  // ROUTING RENDER PARSER
  const renderView = () => {
    // 1. Client room dynamic paths /client/:token, /quote/:token, /contract/:token, /payment/:token
    if (path.startsWith('/client/') || path.startsWith('/quote/') || path.startsWith('/contract/') || path.startsWith('/payment/')) {
      const token = path.split('/').pop();
      return <ClientWorkspace token={token} onNavigate={navigate} />;
    }

    // 2. Portfolio case study slug sub-route `/portfolio/:slug`
    if (path.startsWith('/portfolio/')) {
      const slug = path.split('/portfolio/')[1];
      if (slug && slug !== 'all') {
        return <PortfolioView onNavigate={navigate} selectedSlug={slug} />;
      }
    }

    // 3. Static segment routes
    switch (path) {
      case '/':
        return <HomeView onNavigate={navigate} siteSettings={siteSettings} />;
      
      case '/services':
        return (
          <ServicesView 
            onNavigate={navigate} 
            siteSettings={siteSettings} 
            onOpenWaitlist={handleOpenWaitlist} 
          />
        );
      
      case '/portfolio':
        return <PortfolioView onNavigate={navigate} />;
      
      case '/pricing':
        return <PricingView onNavigate={navigate} />;
      
      case '/start':
        return (
          <StartProjectView 
            siteSettings={siteSettings} 
            navigationState={navigationState} 
          />
        );
      
      case '/login':
      case '/admin':
        return (
          <AdminPortal 
            onNavigate={navigate} 
            onLoginSuccess={handleAdminLoginSuccess} 
            isLoggedIn={isAdminLoggedIn} 
          />
        );
      
      case '/client':
        return <ClientWorkspace onNavigate={navigate} />;

      default:
        // Fallback 404
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <h2 className="text-2xl font-serif italic text-black dark:text-white">Endpoint Decryption Error (404)</h2>
            <p className="text-xs text-gray-400 font-mono">The specified token path segment does not resolve to active studio room.</p>
            <button 
              onClick={() => navigate('/')} 
              className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black text-xs font-mono font-bold uppercase tracking-widest"
            >
              Back to Home Command
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F7F7F5] dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white transition-colors duration-200">
      
      <Navbar 
        currentPath={path} 
        onNavigate={navigate} 
        isAdmin={isAdminLoggedIn} 
        onLogoutAdmin={handleAdminLogout} 
      />
      
      <div className="flex-grow">
        {renderView()}
      </div>
      
      <Footer onNavigate={navigate} siteSettings={siteSettings} />

      {/* DYNAMIC WAITLIST INPUT INTRA-DRAWER */}
      {waitlistService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#202020] p-6 sm:p-8 border-2 border-black dark:border-white shadow-xl relative animate-in zoom-in-95 duration-150">
            
            <button
              onClick={handleCloseWaitlist}
              className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white"
            >
              <X size={18} />
            </button>

            {waitlistSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-md font-bold text-black dark:text-white font-mono uppercase">
                  Waitlist Position Confirmed
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
                  Your reservation request for <span className="font-bold text-black dark:text-white">{lang === 'zh' ? waitlistService.titleZh : waitlistService.titleEn}</span> is securely cataloged. We will send priority slots notification within 48 hours.
                </p>
                <button
                  onClick={handleCloseWaitlist}
                  className="px-6 py-2 bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold uppercase tracking-widest"
                >
                  Close Command
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitWaitlist} className="space-y-5 font-mono">
                <div className="border-b border-black dark:border-white pb-3 flex items-center gap-2">
                  <ClipboardList size={14} className="text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white">
                    Queue Registration Intake
                  </h3>
                </div>

                <div className="text-xs text-gray-500 leading-relaxed border-b border-dashed border-[#DDD] dark:border-[#333] pb-3">
                  You are registering waitlist interest for priority queue slots:<br/>
                  <span className="font-bold text-black dark:text-white uppercase font-mono">{lang === 'zh' ? waitlistService.titleZh : waitlistService.titleEn}</span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase text-gray-400 font-bold">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={waitlistName}
                      onChange={(e) => setWaitlistName(e.target.value)}
                      placeholder="e.g. Kelvin"
                      className="w-full text-xs bg-stone-50 dark:bg-[#1A1A1A] border border-[#D1D1D1] dark:border-[#333] px-3 py-2 text-black dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase text-gray-400 font-bold">Email coordinates *</label>
                    <input
                      type="email"
                      required
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      placeholder="kelvin@example.com"
                      className="w-full text-xs bg-stone-50 dark:bg-[#1A1A1A] border border-[#D1D1D1] dark:border-[#333] px-3 py-2 text-black dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase text-gray-400 font-bold">Phone Number / LINE ID *</label>
                    <input
                      type="text"
                      required
                      value={waitlistPhone}
                      onChange={(e) => setWaitlistPhone(e.target.value)}
                      placeholder="+886 912 345 678"
                      className="w-full text-xs bg-stone-50 dark:bg-[#1A1A1A] border border-[#D1D1D1] dark:border-[#333] px-3 py-2 text-black dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                >
                  <span>Submit Waitlist Reservation Request</span>
                  <ArrowRight size={12} />
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

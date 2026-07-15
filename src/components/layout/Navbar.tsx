/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useLanguage } from '../../lib/i18n/LanguageContext';
import { 
  Globe, 
  Menu, 
  X, 
  Terminal, 
  ArrowRight,
  Sparkles,
  Zap,
  Moon,
  Sun
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isAdmin: boolean;
  onLogoutAdmin: () => void;
}

export default function Navbar({ currentPath, onNavigate, isAdmin, onLogoutAdmin }: NavbarProps) {
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ck_studio_theme');
      return (saved as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '';
      root.style.color = '';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '';
      root.style.color = '';
    }
    localStorage.setItem('ck_studio_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { label: t.nav.home, path: '/' },
    { label: t.nav.services, path: '/services' },
    { label: t.nav.portfolio, path: '/portfolio' },
    { label: t.nav.pricing, path: '/pricing' },
    { label: t.nav.startProject, path: '/start' }
  ];

  const handleItemClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--bg-elevated)]/90 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => handleItemClick('/')}
            className="flex cursor-pointer items-center gap-3 group"
            id="nav-logo"
          >
            <div className="flex h-11 w-14 items-center justify-center overflow-hidden rounded-md border border-[var(--border)] bg-white p-1 shadow-sm transition-transform group-hover:scale-105">
              <img
                src="/ck-logo.png"
                alt="CK Studio"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <span className="font-sans text-lg font-bold tracking-tight text-[var(--text-primary)]">CK Studio</span>
              <div className="text-[9px] font-mono tracking-widest text-[var(--text-secondary)] uppercase font-semibold">STUDIO OS</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleItemClick(item.path)}
                  id={`nav-item-${item.path.replace('/', '') || 'home'}`}
                  className={`text-[11px] font-mono uppercase tracking-widest transition-colors duration-200 py-2 relative ${
                    isActive 
                      ? 'text-[var(--text-primary)] border-b-2 border-[var(--accent)] font-bold' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 border border-[var(--border)] rounded-md hover:bg-[var(--border-subtle)] text-[var(--text-primary)] transition-colors"
              title="Toggle Theme"
              id="btn-theme-toggle"
            >
              {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
            </button>

            {/* Language Selector */}
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="flex items-center gap-1 px-3 py-1.5 border border-[var(--border)] rounded-md hover:bg-[var(--border-subtle)] text-xs font-mono font-bold text-[var(--text-primary)] transition-colors"
              id="btn-lang-toggle"
            >
              <Globe size={13} />
              <span>{lang === 'zh' ? 'EN' : '繁中'}</span>
            </button>

            {/* 後台入口不顯示在公開導覽列；只有已登入且位於 /admin 時顯示登出。 */}
            {isAdmin && currentPath === '/admin' && (
              <button
                onClick={onLogoutAdmin}
                className="px-2.5 py-1.5 border border-red-200 dark:border-red-950 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md text-xs font-mono font-bold transition-colors"
              >
                登出
              </button>
            )}

            {/* CTA */}
            <button
              onClick={() => handleItemClick('/start')}
              className="px-4 py-2 bg-[var(--accent)] hover:opacity-90 text-white font-mono text-[11px] font-bold uppercase tracking-widest transition-all rounded-sm flex items-center gap-2 group shadow-sm hover:-translate-y-0.5"
              id="nav-btn-start"
            >
              <span>{t.nav.startProject}</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 border border-[#D1D1D1] dark:border-[#333] rounded hover:bg-gray-100 dark:hover:bg-[#252525]"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="px-2 py-1 border border-[#D1D1D1] dark:border-[#333] rounded text-xs font-mono font-bold"
            >
              {lang === 'zh' ? 'EN' : '繁'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#1A1A1A] dark:text-white"
              id="btn-mobile-menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#D1D1D1] bg-white dark:bg-[#1A1A1A] px-6 py-6 space-y-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleItemClick(item.path)}
                className={`text-left text-xs font-bold uppercase tracking-widest py-3 border-b border-[#F0F0F0] dark:border-[#252525] ${
                  currentPath === item.path ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 pt-2">
            {isAdmin && currentPath === '/admin' && (
              <button
                onClick={onLogoutAdmin}
                className="w-full text-center py-3 border border-red-500/40 text-red-400 font-mono text-xs font-bold"
              >
                登出後台
              </button>
            )}
            <button
              onClick={() => handleItemClick('/start')}
              className="w-full text-center py-3 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest"
            >
              {t.nav.startProject}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useLanguage } from '../../lib/i18n/LanguageContext';
import { Github, Twitter, Terminal, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
  siteSettings: {
    studioName: string;
    email: string;
    phone: string;
    socials: {
      github?: string;
      twitter?: string;
    }
  };
}

export default function Footer({ onNavigate, siteSettings }: FooterProps) {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-[var(--bg-elevated)] border-t border-[var(--border)] transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 border-b border-[var(--border)] pb-10">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('/')}>
              <div className="flex h-9 w-12 items-center justify-center overflow-hidden rounded-md border border-[var(--border)] bg-white p-1">
                <img
                  src="/ck-logo.png"
                  alt="CK Studio"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="font-sans text-base font-bold tracking-tight text-[var(--text-primary)]">
                {siteSettings.studioName}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] max-w-md leading-relaxed">
              {t.brand.tagline}
            </p>
            <div className="flex gap-4">
              {siteSettings.socials.github && (
                <a 
                  href={siteSettings.socials.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <Github size={15} />
                </a>
              )}
              {siteSettings.socials.twitter && (
                <a 
                  href={siteSettings.socials.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <Twitter size={15} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] font-mono font-bold tracking-widest uppercase text-[var(--text-secondary)] mb-4">
              Studio Operations
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button 
                  onClick={() => onNavigate('/')}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors uppercase font-mono font-bold"
                >
                  {t.nav.home}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/services')}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors uppercase font-mono font-bold"
                >
                  {t.nav.services}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/portfolio')}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors uppercase font-mono font-bold"
                >
                  {t.nav.portfolio}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('/pricing')}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors uppercase font-mono font-bold"
                >
                  {t.nav.pricing}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-[10px] font-mono font-bold tracking-widest uppercase text-[var(--text-secondary)] mb-4">
              Contacts & Enquiries
            </h4>
            <ul className="space-y-2.5 font-mono text-xs">
              <li className="text-[var(--text-secondary)]">
                Email: <span className="text-[var(--text-primary)] font-bold">{siteSettings.email}</span>
              </li>
              <li className="text-[var(--text-secondary)]">
                Phone: <span className="text-[var(--text-primary)]">{siteSettings.phone}</span>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => onNavigate('/start')}
                  className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent)] hover:underline"
                >
                  <span>{t.nav.startProject}</span>
                  <span>→</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] gap-4">
          <div className="flex items-center gap-1">
            <span>STUDIO OPERATIONS PLATFORM</span>
          </div>
          <div>
            {t.brand.footerCopy}
          </div>
        </div>

      </div>
    </footer>
  );
}

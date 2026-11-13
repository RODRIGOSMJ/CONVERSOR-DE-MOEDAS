import React from 'react';
import { CurrencyInfo } from '../data/currencies';

interface CurrencyBadgeProps {
  info: CurrencyInfo;
  size?: 'sm' | 'md';
}

const FiatFlagSvg: React.FC<{ country?: string; symbol: string }> = ({ country, symbol }) => {
  switch (country) {
    case 'br':
      return (
        <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
          <rect width="36" height="36" fill="#009b3a" />
          <polygon points="18,5 32,18 18,31 4,18" fill="#fedf00" />
          <circle cx="18" cy="18" r="6.8" fill="#002776" />
          <path d="M12.2 16.5 Q18 19.8 24 16.8" stroke="#ffffff" strokeWidth="1.4" fill="none" />
        </svg>
      );
    case 'us':
      return (
        <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
          <rect width="36" height="36" fill="#ffffff" />
          <rect y="0" width="36" height="3" fill="#b22234" />
          <rect y="6" width="36" height="3" fill="#b22234" />
          <rect y="12" width="36" height="3" fill="#b22234" />
          <rect y="18" width="36" height="3" fill="#b22234" />
          <rect y="24" width="36" height="3" fill="#b22234" />
          <rect y="30" width="36" height="3" fill="#b22234" />
          <rect y="33" width="36" height="3" fill="#b22234" />
          <rect width="18" height="19" fill="#3c3b6e" />
          <circle cx="4.5" cy="4.5" r="1" fill="#ffffff" />
          <circle cx="9" cy="4.5" r="1" fill="#ffffff" />
          <circle cx="13.5" cy="4.5" r="1" fill="#ffffff" />
          <circle cx="6.7" cy="9" r="1" fill="#ffffff" />
          <circle cx="11.2" cy="9" r="1" fill="#ffffff" />
          <circle cx="4.5" cy="13.5" r="1" fill="#ffffff" />
          <circle cx="9" cy="13.5" r="1" fill="#ffffff" />
          <circle cx="13.5" cy="13.5" r="1" fill="#ffffff" />
        </svg>
      );
    case 'eu':
      return (
        <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
          <rect width="36" height="36" fill="#003399" />
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const cx = 18 + Math.cos(angle) * 10;
            const cy = 18 + Math.sin(angle) * 10;
            return <circle key={i} cx={cx} cy={cy} r="1.3" fill="#ffcc00" />;
          })}
        </svg>
      );
    case 'gb':
      return (
        <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
          <rect width="36" height="36" fill="#012169" />
          <path d="M0,0 L36,36 M36,0 L0,36" stroke="#ffffff" strokeWidth="6" />
          <path d="M0,0 L36,36 M36,0 L0,36" stroke="#c8102e" strokeWidth="3" />
          <path d="M18,0 V36 M0,18 H36" stroke="#ffffff" strokeWidth="8" />
          <path d="M18,0 V36 M0,18 H36" stroke="#c8102e" strokeWidth="4.5" />
        </svg>
      );
    case 'ca':
      return (
        <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
          <rect width="36" height="36" fill="#ffffff" />
          <rect width="9" height="36" fill="#d80621" />
          <rect x="27" width="9" height="36" fill="#d80621" />
          <path d="M18 8 L20 14 L25 13 L22 18 L25 21 L19.5 21.5 L18.5 27 H17.5 L16.5 21.5 L11 21 L14 18 L11 13 L16 14 Z" fill="#d80621" />
        </svg>
      );
    case 'au':
      return (
        <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
          <rect width="36" height="36" fill="#00008b" />
          <rect width="18" height="18" fill="#012169" />
          <path d="M0,0 L18,18 M18,0 L0,18" stroke="#ffffff" strokeWidth="3" />
          <path d="M0,0 L18,18 M18,0 L0,18" stroke="#c8102e" strokeWidth="1.5" />
          <path d="M9,0 V18 M0,9 H18" stroke="#ffffff" strokeWidth="4" />
          <path d="M9,0 V18 M0,9 H18" stroke="#c8102e" strokeWidth="2.2" />
          <circle cx="9" cy="26" r="2.2" fill="#ffffff" />
          <circle cx="27" cy="11" r="1.5" fill="#ffffff" />
          <circle cx="30" cy="18" r="1.5" fill="#ffffff" />
          <circle cx="26" cy="25" r="1.5" fill="#ffffff" />
          <circle cx="22" cy="16" r="1.3" fill="#ffffff" />
        </svg>
      );
    case 'jp':
      return (
        <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
          <rect width="36" height="36" fill="#ffffff" />
          <circle cx="18" cy="18" r="8.5" fill="#bc002d" />
        </svg>
      );
    case 'ch':
      return (
        <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
          <rect width="36" height="36" fill="#d52b1e" />
          <rect x="15" y="8" width="6" height="20" fill="#ffffff" />
          <rect x="8" y="15" width="20" height="6" fill="#ffffff" />
        </svg>
      );
    case 'ar':
      return (
        <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
          <rect width="36" height="12" fill="#74acdf" />
          <rect y="12" width="36" height="12" fill="#ffffff" />
          <rect y="24" width="36" height="12" fill="#74acdf" />
          <circle cx="18" cy="18" r="3.8" fill="#f6b40e" />
        </svg>
      );
    case 'py':
      return (
        <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
          <rect width="36" height="12" fill="#d52b1e" />
          <rect y="12" width="36" height="12" fill="#ffffff" />
          <rect y="24" width="36" height="12" fill="#0038a8" />
          <circle cx="18" cy="18" r="3.5" fill="none" stroke="#15803d" strokeWidth="1.4" />
        </svg>
      );
    case 'cl':
      return (
        <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
          <rect width="36" height="18" fill="#ffffff" />
          <rect y="18" width="36" height="18" fill="#d52b1e" />
          <rect width="18" height="18" fill="#0039a6" />
          <polygon points="9,4.5 10.4,8.5 14.5,8.5 11.2,11 12.4,15 9,12.5 5.6,15 6.8,11 3.5,8.5 7.6,8.5" fill="#ffffff" />
        </svg>
      );
    case 'uy':
      return (
        <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
          <rect width="36" height="36" fill="#ffffff" />
          <rect y="4" width="36" height="4" fill="#0038a8" />
          <rect y="12" width="36" height="4" fill="#0038a8" />
          <rect y="20" width="36" height="4" fill="#0038a8" />
          <rect y="28" width="36" height="4" fill="#0038a8" />
          <rect width="17" height="16" fill="#ffffff" />
          <circle cx="8.5" cy="8" r="4.2" fill="#fcd116" />
        </svg>
      );
    case 'mx':
      return (
        <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
          <rect width="12" height="36" fill="#006847" />
          <rect x="12" width="12" height="36" fill="#ffffff" />
          <rect x="24" width="12" height="36" fill="#ce1126" />
          <circle cx="18" cy="18" r="3.5" fill="#8b5a2b" />
        </svg>
      );
    case 'cn':
      return (
        <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
          <rect width="36" height="36" fill="#de2910" />
          <polygon points="9,5 10.5,9.5 15,9.5 11.4,12 12.8,16.5 9,13.8 5.2,16.5 6.6,12 3,9.5 7.5,9.5" fill="#ffde00" />
          <circle cx="17" cy="6" r="1.2" fill="#ffde00" />
          <circle cx="19.5" cy="9" r="1.2" fill="#ffde00" />
          <circle cx="19.5" cy="13" r="1.2" fill="#ffde00" />
          <circle cx="17" cy="16" r="1.2" fill="#ffde00" />
        </svg>
      );
    default:
      return (
        <span className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200">
          {symbol}
        </span>
      );
  }
};

export const CurrencyBadge: React.FC<CurrencyBadgeProps> = ({ info, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';
  const iconClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  if (info.crypto) {
    switch (info.crypto) {
      case 'btc':
        return (
          <div className={`${sizeClass} rounded-full bg-gradient-to-br from-[#f7931a] to-[#d97706] flex items-center justify-center shadow-sm ring-1 ring-black/10 shrink-0`}>
            <svg viewBox="0 0 32 32" className={`${iconClass} fill-white`} aria-hidden="true">
              <path d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z" />
            </svg>
          </div>
        );
      case 'eth':
        return (
          <div className={`${sizeClass} rounded-full bg-gradient-to-br from-[#627eea] to-[#3c54b8] flex items-center justify-center shadow-sm ring-1 ring-black/10 shrink-0`}>
            <svg viewBox="0 0 32 32" className={`${iconClass} fill-white`} aria-hidden="true">
              <path d="M16.498 4v8.87l7.497 3.35z" fillOpacity="0.75" />
              <path d="M16.498 4L9 16.22l7.498-3.35z" />
              <path d="M16.498 21.968v6.027L24 17.616z" fillOpacity="0.75" />
              <path d="M16.498 27.995v-6.028L9 17.616z" />
              <path d="M16.498 20.573l7.497-4.353-7.497-3.348z" fillOpacity="0.55" />
              <path d="M9 16.22l7.498 4.353v-7.701z" fillOpacity="0.85" />
            </svg>
          </div>
        );
      case 'sol':
        return (
          <div className={`${sizeClass} rounded-full bg-gradient-to-br from-[#141722] via-[#1c1f2e] to-[#0f111a] flex items-center justify-center shadow-sm ring-1 ring-purple-500/40 shrink-0`}>
            <svg viewBox="0 0 397.7 311.7" className={iconClass} aria-hidden="true">
              <defs>
                <linearGradient id="solGradBadge" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9945FF" />
                  <stop offset="50%" stopColor="#19FB9B" />
                  <stop offset="100%" stopColor="#00FFA3" />
                </linearGradient>
              </defs>
              <path fill="url(#solGradBadge)" d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" />
              <path fill="url(#solGradBadge)" d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" />
              <path fill="url(#solGradBadge)" d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" />
            </svg>
          </div>
        );
      case 'pol':
        return (
          <div className={`${sizeClass} rounded-full bg-gradient-to-br from-[#8247e5] to-[#5b21b6] flex items-center justify-center shadow-sm ring-1 ring-black/10 shrink-0`}>
            <svg viewBox="0 0 38.4 33.5" className={`${iconClass} fill-white`} aria-hidden="true">
              <path d="M28.8 10.2c-.7-.4-1.6-.4-2.4 0l-5.6 3.3-3.8 2.1-5.6 3.3c-.7.4-1.6.4-2.4 0l-4.4-2.6c-.7-.4-1.2-1.2-1.2-2.1v-5.1c0-.8.4-1.6 1.2-2.1l4.4-2.5c.7-.4 1.6-.4 2.4 0l4.4 2.5c.7.4 1.2 1.2 1.2 2.1v3.3l3.8-2.2V6.9c0-.8-.4-1.6-1.2-2.1L11.4.3c-.7-.4-1.6-.4-2.4 0L1.2 4.8C.4 5.2 0 6 0 6.9v9.2c0 .8.4 1.6 1.2 2.1l7.8 4.5c.7.4 1.6.4 2.4 0l5.6-3.2 3.8-2.2 5.6-3.2c.7-.4 1.6-.4 2.4 0l4.4 2.5c.7.4 1.2 1.2 1.2 2.1v5.1c0 .8-.4 1.6-1.2 2.1l-4.4 2.6c-.7.4-1.6.4-2.4 0l-4.4-2.5c-.7-.4-1.2-1.2-1.2-2.1v-3.2l-3.8 2.2v3.3c0 .8.4 1.6 1.2 2.1l7.8 4.5c.7.4 1.6.4 2.4 0l7.8-4.5c.7-.4 1.2-1.2 1.2-2.1v-9.2c0-.8-.4-1.6-1.2-2.1l-7.8-4.6z" />
            </svg>
          </div>
        );
      case 'trx':
        return (
          <div className={`${sizeClass} rounded-full bg-gradient-to-br from-[#ef0027] to-[#b91c1c] flex items-center justify-center shadow-sm ring-1 ring-black/10 shrink-0`}>
            <svg viewBox="0 0 32 32" className={`${iconClass} fill-white`} aria-hidden="true">
              <path d="M25.6 10.5L6.2 6.8l9.1 19.6 11.9-14.2-1.6-1.7zm-9.4 1.7l6.9 1.3-5.2 2.3-1.7-3.6zm-1.4.6l1.7 3.7-6.7-7.1 5 3.4zm2.2 4.5l6-2.7-6.8 8.2.8-5.5z" />
            </svg>
          </div>
        );
      case 'bnb':
        return (
          <div className={`${sizeClass} rounded-full bg-gradient-to-br from-[#f3ba2f] to-[#d99b16] flex items-center justify-center shadow-sm ring-1 ring-black/10 shrink-0`}>
            <svg viewBox="0 0 32 32" className={`${iconClass} fill-white`} aria-hidden="true">
              <path d="M16 6.2l3.8 3.8-2.2 2.2-1.6-1.6-1.6 1.6-2.2-2.2L16 6.2zm-6 6l2.2 2.2-2.2 2.2-2.2-2.2L10 12.2zm12 0l2.2 2.2-2.2 2.2-2.2-2.2L22 12.2zM16 13.8l2.2 2.2-2.2 2.2-2.2-2.2 2.2-2.2zm0 8.4l1.6-1.6 2.2 2.2L16 26.6l-3.8-3.8 2.2-2.2 1.6 1.6z" />
            </svg>
          </div>
        );
    }
  }

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden shadow-sm ring-1 ring-slate-300/80 dark:ring-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0`}>
      <FiatFlagSvg country={info.country} symbol={info.symbol} />
    </div>
  );
};

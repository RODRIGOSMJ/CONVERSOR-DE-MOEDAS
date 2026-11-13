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
        <svg viewBox="0 0 44 28" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
          <rect width="44" height="28" fill="#009b3a" />
          <polygon points="22,3 40,14 22,25 4,14" fill="#fedf00" />
          <circle cx="22" cy="14" r="6" fill="#002776" />
          <path d="M16.5 12.8 Q22 15.8 27.6 13" stroke="#ffffff" strokeWidth="1.2" fill="none" />
        </svg>
      );
    case 'us':
      return (
        <svg viewBox="0 0 44 28" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
          <rect width="44" height="28" fill="#ffffff" />
          <rect y="0" width="44" height="2.2" fill="#b22234" />
          <rect y="4.3" width="44" height="2.2" fill="#b22234" />
          <rect y="8.6" width="44" height="2.2" fill="#b22234" />
          <rect y="12.9" width="44" height="2.2" fill="#b22234" />
          <rect y="17.2" width="44" height="2.2" fill="#b22234" />
          <rect y="21.5" width="44" height="2.2" fill="#b22234" />
          <rect y="25.8" width="44" height="2.2" fill="#b22234" />
          <rect width="19" height="15.1" fill="#3c3b6e" />
          <circle cx="4.2" cy="3.8" r="0.9" fill="#ffffff" />
          <circle cx="9.5" cy="3.8" r="0.9" fill="#ffffff" />
          <circle cx="14.8" cy="3.8" r="0.9" fill="#ffffff" />
          <circle cx="6.8" cy="7.5" r="0.9" fill="#ffffff" />
          <circle cx="12.2" cy="7.5" r="0.9" fill="#ffffff" />
          <circle cx="4.2" cy="11.3" r="0.9" fill="#ffffff" />
          <circle cx="9.5" cy="11.3" r="0.9" fill="#ffffff" />
          <circle cx="14.8" cy="11.3" r="0.9" fill="#ffffff" />
        </svg>
      );
    case 'eu':
      return (
        <svg viewBox="0 0 44 28" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
          <rect width="44" height="28" fill="#003399" />
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const cx = 22 + Math.cos(angle) * 8.5;
            const cy = 14 + Math.sin(angle) * 8.5;
            return <circle key={i} cx={cx} cy={cy} r="1.15" fill="#ffcc00" />;
          })}
        </svg>
      );
    case 'gb':
      return (
        <svg viewBox="0 0 44 28" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
          <rect width="44" height="28" fill="#012169" />
          <path d="M0,0 L44,28 M44,0 L0,28" stroke="#ffffff" strokeWidth="5" />
          <path d="M0,0 L44,28 M44,0 L0,28" stroke="#c8102e" strokeWidth="2.5" />
          <path d="M22,0 V28 M0,14 H44" stroke="#ffffff" strokeWidth="7" />
          <path d="M22,0 V28 M0,14 H44" stroke="#c8102e" strokeWidth="4" />
        </svg>
      );
    case 'ca':
      return (
        <svg viewBox="0 0 44 28" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
          <rect width="44" height="28" fill="#ffffff" />
          <rect width="11" height="28" fill="#d80621" />
          <rect x="33" width="11" height="28" fill="#d80621" />
          <path d="M22 6 L24 11 L28 10 L25.5 14.5 L28 17 L23.5 17.5 L22.5 22 H21.5 L20.5 17.5 L16 17 L18.5 14.5 L16 10 L20 11 Z" fill="#d80621" />
        </svg>
      );
    case 'au':
      return (
        <svg viewBox="0 0 44 28" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
          <rect width="44" height="28" fill="#00008b" />
          <rect width="20" height="14" fill="#012169" />
          <path d="M0,0 L20,14 M20,0 L0,14" stroke="#ffffff" strokeWidth="2.6" />
          <path d="M0,0 L20,14 M20,0 L0,14" stroke="#c8102e" strokeWidth="1.2" />
          <path d="M10,0 V14 M0,7 H20" stroke="#ffffff" strokeWidth="3.6" />
          <path d="M10,0 V14 M0,7 H20" stroke="#c8102e" strokeWidth="2" />
          <circle cx="10" cy="21" r="2" fill="#ffffff" />
          <circle cx="33" cy="8" r="1.4" fill="#ffffff" />
          <circle cx="37" cy="14" r="1.4" fill="#ffffff" />
          <circle cx="32" cy="20" r="1.4" fill="#ffffff" />
          <circle cx="28" cy="13" r="1.2" fill="#ffffff" />
        </svg>
      );
    case 'jp':
      return (
        <svg viewBox="0 0 44 28" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
          <rect width="44" height="28" fill="#ffffff" />
          <circle cx="22" cy="14" r="7.2" fill="#bc002d" />
        </svg>
      );
    case 'ch':
      return (
        <svg viewBox="0 0 44 28" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
          <rect width="44" height="28" fill="#d52b1e" />
          <rect x="19" y="6" width="6" height="16" fill="#ffffff" />
          <rect x="14" y="11" width="16" height="6" fill="#ffffff" />
        </svg>
      );
    case 'ar':
      return (
        <svg viewBox="0 0 44 28" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
          <rect width="44" height="9.3" fill="#74acdf" />
          <rect y="9.3" width="44" height="9.4" fill="#ffffff" />
          <rect y="18.7" width="44" height="9.3" fill="#74acdf" />
          <circle cx="22" cy="14" r="3.4" fill="#f6b40e" />
        </svg>
      );
    case 'py':
      return (
        <svg viewBox="0 0 44 28" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
          <rect width="44" height="9.3" fill="#d52b1e" />
          <rect y="9.3" width="44" height="9.4" fill="#ffffff" />
          <rect y="18.7" width="44" height="9.3" fill="#0038a8" />
          <circle cx="22" cy="14" r="3.1" fill="none" stroke="#15803d" strokeWidth="1.2" />
        </svg>
      );
    case 'cl':
      return (
        <svg viewBox="0 0 44 28" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
          <rect width="44" height="14" fill="#ffffff" />
          <rect y="14" width="44" height="14" fill="#d52b1e" />
          <rect width="16" height="14" fill="#0039a6" />
          <polygon points="8,3.2 9.2,6.4 12.6,6.4 9.8,8.4 10.9,11.6 8,9.6 5.1,11.6 6.2,8.4 3.4,6.4 6.8,6.4" fill="#ffffff" />
        </svg>
      );
    case 'uy':
      return (
        <svg viewBox="0 0 44 28" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
          <rect width="44" height="28" fill="#ffffff" />
          <rect y="3.2" width="44" height="3.2" fill="#0038a8" />
          <rect y="9.6" width="44" height="3.2" fill="#0038a8" />
          <rect y="16" width="44" height="3.2" fill="#0038a8" />
          <rect y="22.4" width="44" height="3.2" fill="#0038a8" />
          <rect width="17" height="13" fill="#ffffff" />
          <circle cx="8.5" cy="6.5" r="3.6" fill="#fcd116" />
        </svg>
      );
    case 'mx':
      return (
        <svg viewBox="0 0 44 28" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
          <rect width="14.7" height="28" fill="#006847" />
          <rect x="14.7" width="14.6" height="28" fill="#ffffff" />
          <rect x="29.3" width="14.7" height="28" fill="#ce1126" />
          <circle cx="22" cy="14" r="3.2" fill="#8b5a2b" />
        </svg>
      );
    case 'cn':
      return (
        <svg viewBox="0 0 44 28" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
          <rect width="44" height="28" fill="#de2910" />
          <polygon points="9,4.5 10.2,8.2 14,8.2 11,10.4 12.1,14 9,11.8 5.9,14 7,10.4 4,8.2 7.8,8.2" fill="#ffde00" />
          <circle cx="17" cy="5.5" r="1" fill="#ffde00" />
          <circle cx="19.5" cy="8" r="1" fill="#ffde00" />
          <circle cx="19.5" cy="11.5" r="1" fill="#ffde00" />
          <circle cx="17" cy="14" r="1" fill="#ffde00" />
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
  const cryptoSize = size === 'sm' ? 'w-9 h-9' : 'w-10 h-10';
  const iconClass = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
  const flagSize = size === 'sm' ? 'w-10 h-7' : 'w-11 h-7';

  if (info.crypto) {
    switch (info.crypto) {
      case 'btc':
        return (
          <div className={`${cryptoSize} rounded-full bg-gradient-to-br from-[#f7931a] to-[#d97706] flex items-center justify-center shadow-sm shrink-0`}>
            <svg viewBox="0 0 32 32" className={`${iconClass} fill-white`} aria-hidden="true">
              <path d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z" />
            </svg>
          </div>
        );
      case 'eth':
        return (
          <div className={`${cryptoSize} rounded-full bg-gradient-to-br from-[#627eea] to-[#3c54b8] flex items-center justify-center shadow-sm shrink-0`}>
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
          <div className={`${cryptoSize} rounded-full bg-[#181b26] flex items-center justify-center shadow-sm ring-1 ring-purple-500/40 shrink-0`}>
            <svg viewBox="0 0 397.7 311.7" className="w-5 h-5" aria-hidden="true">
              <defs>
                <linearGradient id="solGradClean" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9945FF" />
                  <stop offset="50%" stopColor="#19FB9B" />
                  <stop offset="100%" stopColor="#00FFA3" />
                </linearGradient>
              </defs>
              <path fill="url(#solGradClean)" d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" />
              <path fill="url(#solGradClean)" d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" />
              <path fill="url(#solGradClean)" d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" />
            </svg>
          </div>
        );
      case 'pol':
        return (
          <div className={`${cryptoSize} rounded-full bg-gradient-to-br from-[#8247e5] to-[#5b21b6] flex items-center justify-center shadow-sm shrink-0`}>
            <svg viewBox="0 0 38.4 33.5" className="w-5 h-5 fill-white" aria-hidden="true">
              <path d="M28.8 10.2c-.7-.4-1.6-.4-2.4 0l-5.6 3.3-3.8 2.1-5.6 3.3c-.7.4-1.6.4-2.4 0l-4.4-2.6c-.7-.4-1.2-1.2-1.2-2.1v-5.1c0-.8.4-1.6 1.2-2.1l4.4-2.5c.7-.4 1.6-.4 2.4 0l4.4 2.5c.7.4 1.2 1.2 1.2 2.1v3.3l3.8-2.2V6.9c0-.8-.4-1.6-1.2-2.1L11.4.3c-.7-.4-1.6-.4-2.4 0L1.2 4.8C.4 5.2 0 6 0 6.9v9.2c0 .8.4 1.6 1.2 2.1l7.8 4.5c.7.4 1.6.4 2.4 0l5.6-3.2 3.8-2.2 5.6-3.2c.7-.4 1.6-.4 2.4 0l4.4 2.5c.7.4 1.2 1.2 1.2 2.1v5.1c0 .8-.4 1.6-1.2 2.1l-4.4 2.6c-.7.4-1.6.4-2.4 0l-4.4-2.5c-.7-.4-1.2-1.2-1.2-2.1v-3.2l-3.8 2.2v3.3c0 .8.4 1.6 1.2 2.1l7.8 4.5c.7.4 1.6.4 2.4 0l7.8-4.5c.7-.4 1.2-1.2 1.2-2.1v-9.2c0-.8-.4-1.6-1.2-2.1l-7.8-4.6z" />
            </svg>
          </div>
        );
      case 'trx':
        return (
          <div className={`${cryptoSize} rounded-full bg-gradient-to-br from-[#ef0027] to-[#b91c1c] flex items-center justify-center shadow-sm shrink-0`}>
            <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white" aria-hidden="true">
              <path d="M25.6 10.5L6.2 6.8l9.1 19.6 11.9-14.2-1.6-1.7zm-9.4 1.7l6.9 1.3-5.2 2.3-1.7-3.6zm-1.4.6l1.7 3.7-6.7-7.1 5 3.4zm2.2 4.5l6-2.7-6.8 8.2.8-5.5z" />
            </svg>
          </div>
        );
      case 'bnb':
        return (
          <div className={`${cryptoSize} rounded-full bg-gradient-to-br from-[#f3ba2f] to-[#d99b16] flex items-center justify-center shadow-sm shrink-0`}>
            <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white" aria-hidden="true">
              <path d="M16 6.2l3.8 3.8-2.2 2.2-1.6-1.6-1.6 1.6-2.2-2.2L16 6.2zm-6 6l2.2 2.2-2.2 2.2-2.2-2.2L10 12.2zm12 0l2.2 2.2-2.2 2.2-2.2-2.2L22 12.2zM16 13.8l2.2 2.2-2.2 2.2-2.2-2.2 2.2-2.2zm0 8.4l1.6-1.6 2.2 2.2L16 26.6l-3.8-3.8 2.2-2.2 1.6 1.6z" />
            </svg>
          </div>
        );
    }
  }

  return (
    <div
      className={`${flagSize} rounded-[4px] overflow-hidden shadow-xs ring-1 ring-black/15 dark:ring-white/15 bg-slate-200 dark:bg-[#2a2a2a] flex items-center justify-center shrink-0`}
    >
      <FiatFlagSvg country={info.country} symbol={info.symbol} />
    </div>
  );
};

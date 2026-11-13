import React, { useEffect, useState } from 'react';
import { Download, DownloadCloud, Share, Smartphone, X } from 'lucide-react';
import { ALL_CURRENCIES, CURRENCY_MAP } from '../data/currencies';
import { CurrencyBadge } from './CurrencyBadge';
import { RateHistoryChart } from './RateHistoryChart';

/* =========================================================
   1. MODAL: GERENCIAR MOEDAS
   ========================================================= */
interface AddCurrencyModalProps {
  open: boolean;
  selectedCodes: string[];
  onClose: () => void;
  onToggleCurrency: (code: string) => void;
}

export const AddCurrencyModal: React.FC<AddCurrencyModalProps> = ({
  open,
  selectedCodes,
  onClose,
  onToggleCurrency,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  if (!open) return null;

  const trimmed = query.trim().toLowerCase();
  const filtered = ALL_CURRENCIES.filter(
    (c) => c.code.toLowerCase().includes(trimmed) || c.name.toLowerCase().includes(trimmed)
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1e1e1e] w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl max-h-[84vh] flex flex-col shadow-2xl border border-slate-200 dark:border-[#2e2e2e] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3.5 border-b border-slate-200 dark:border-[#2c2c2c] flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Gerenciar moedas
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela de moedas"
            className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-[#2a2a2a] text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 border-b border-slate-200 dark:border-[#2c2c2c]">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar moeda (USD, BRL, BTC, ETH, SOL, POL, TRX, BNB...)"
            autoFocus
            className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-[#141414] border border-slate-300 dark:border-[#333333] focus:outline-none focus:border-[#4f86c6] text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex-1 overflow-y-auto currency-scroll divide-y divide-slate-100 dark:divide-[#262626] p-2">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              Nenhuma moeda encontrada para "{query}".
            </p>
          ) : (
            filtered.map((c) => {
              const isSelected = selectedCodes.includes(c.code);
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => onToggleCurrency(c.code)}
                  className="w-full px-3.5 py-3 min-h-[56px] flex items-center justify-between hover:bg-slate-100 dark:hover:bg-[#262626] rounded-xl transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CurrencyBadge info={c} size="sm" />
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {c.code}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {c.name}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-lg whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-[#4f86c6]/20 text-[#4f86c6]'
                        : 'bg-slate-200 dark:bg-[#2a2a2a] text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isSelected ? 'Ativa ✓' : '+ Adicionar'}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   2. MODAL: GRÁFICO HISTÓRICO
   ========================================================= */
interface ChartModalProps {
  open: boolean;
  fromCode: string;
  toCode: string;
  currentRate: number;
  isOnline: boolean;
  onClose: () => void;
}

export const ChartModal: React.FC<ChartModalProps> = ({
  open,
  fromCode,
  toCode,
  currentRate,
  isOnline,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1e1e1e] w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl p-5 shadow-2xl border border-slate-200 dark:border-[#2e2e2e] space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Histórico {fromCode} → {toCode}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Variação recente da cotação
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar gráfico"
            className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-[#2a2a2a] text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <RateHistoryChart
          fromCode={fromCode}
          toCode={toCode}
          currentRate={currentRate}
          isOnline={isOnline}
        />
      </div>
    </div>
  );
};

/* =========================================================
   3. MODAL: MINHA TAXA PERSONALIZADA
   ========================================================= */
interface CustomRateModalProps {
  open: boolean;
  activeCode: string;
  selectedCodes: string[];
  getEffectiveRate: (code: string) => number;
  onClose: () => void;
  onSaveCustomRate: (targetCode: string, unitValue: number) => void;
  onResetCustomRates: () => void;
}

export const CustomRateModal: React.FC<CustomRateModalProps> = ({
  open,
  activeCode,
  selectedCodes,
  getEffectiveRate,
  onClose,
  onSaveCustomRate,
  onResetCustomRates,
}) => {
  const availableTargets = selectedCodes.filter((c) => c !== activeCode);
  const [targetCode, setTargetCode] = useState<string>(availableTargets[0] || 'BRL');
  const [inputVal, setInputVal] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    const initialTarget = availableTargets[0] || 'BRL';
    setTargetCode(initialTarget);
    const currentUnit = getEffectiveRate(initialTarget) / getEffectiveRate(activeCode);
    setInputVal(Number(currentUnit.toFixed(6)).toString());
  }, [open, activeCode]);

  const handleTargetChange = (newTarget: string) => {
    setTargetCode(newTarget);
    const currentUnit = getEffectiveRate(newTarget) / getEffectiveRate(activeCode);
    setInputVal(Number(currentUnit.toFixed(6)).toString());
  };

  if (!open) return null;

  const targetInfo = CURRENCY_MAP[targetCode];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1e1e1e] w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl p-5 shadow-2xl border border-slate-200 dark:border-[#2e2e2e] space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Minha taxa personalizada
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar taxa personalizada"
            className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-[#2a2a2a] text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Defina uma cotação manual para substituir a taxa automática:
        </p>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Moeda de destino
          </label>
          <select
            value={targetCode}
            onChange={(e) => handleTargetChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#141414] border border-slate-300 dark:border-[#333333] text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#4f86c6]"
          >
            {availableTargets.map((code) => {
              const info = CURRENCY_MAP[code];
              return (
                <option key={code} value={code}>
                  {code} · {info?.name || code}
                </option>
              );
            })}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-200 block">
            1 {activeCode} vale quanto em {targetCode} ({targetInfo?.name || targetCode})?
          </label>
          <input
            type="number"
            step="any"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full px-3.5 py-3 rounded-xl bg-slate-100 dark:bg-[#141414] border border-slate-300 dark:border-[#333333] font-mono-tabular text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#4f86c6]"
          />
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={onResetCustomRates}
            className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-[#2a2a2a] text-sm font-bold text-slate-700 dark:text-slate-300 hover:opacity-90 cursor-pointer"
          >
            Restaurar Oficial
          </button>
          <button
            type="button"
            onClick={() => {
              const parsed = parseFloat(inputVal.replace(',', '.'));
              onSaveCustomRate(targetCode, parsed);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#4f86c6] hover:bg-[#5c94d6] text-white text-sm font-bold cursor-pointer"
          >
            Aplicar Taxa
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   4. MODAL: BAIXAR / INSTALAR APLICATIVO (PWA)
   ========================================================= */
interface InstallAppModalProps {
  open: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  onClose: () => void;
  onTriggerInstall: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  open,
  isInstallable,
  isInstalled,
  isIOS,
  onClose,
  onTriggerInstall,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1e1e1e] w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl p-5 shadow-2xl border border-slate-200 dark:border-[#2e2e2e] space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#4f86c6]/15 text-[#4f86c6]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Baixar Aplicativo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Para celular, tablet e desktop (Android / iOS)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela de instalação"
            className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-[#2a2a2a] text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isInstalled ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
            O CONVERSOR PLUS já está instalado como aplicativo neste dispositivo.
          </div>
        ) : isInstallable ? (
          <button
            type="button"
            onClick={onTriggerInstall}
            className="w-full py-3.5 px-4 rounded-xl bg-[#4f86c6] hover:bg-[#5c94d6] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
          >
            <DownloadCloud className="w-5 h-5" />
            <span>Instalar Aplicativo Agora</span>
          </button>
        ) : isIOS ? (
          <div className="bg-slate-100 dark:bg-[#141414] rounded-xl p-4 space-y-2.5 border border-slate-200 dark:border-[#2a2a2a] text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Share className="w-4 h-4 text-[#4f86c6]" />
              <span>Como instalar no iPhone ou iPad (Safari):</span>
            </div>
            <p>1. Toque em <strong>Compartilhar</strong> na barra inferior do Safari.</p>
            <p>2. Selecione <strong>Adicionar à Tela de Início</strong>.</p>
            <p>3. Confirme em <strong>Adicionar</strong> para usar em tela cheia.</p>
          </div>
        ) : (
          <div className="bg-slate-100 dark:bg-[#141414] rounded-xl p-4 space-y-2.5 border border-slate-200 dark:border-[#2a2a2a] text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Download className="w-4 h-4 text-[#4f86c6]" />
              <span>Como instalar no Android, Chrome ou Edge:</span>
            </div>
            <p>1. Abra o menu do navegador (<strong>⋮</strong>) ou clique no ícone de instalação na barra de endereço.</p>
            <p>2. Selecione <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</p>
            <p>3. Funciona em tela cheia e salva as últimas cotações para uso offline.</p>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeftRight,
  ChevronDown,
  Equal,
  ListPlus,
  Menu,
  Moon,
  Pencil,
  SlidersHorizontal,
  Sun,
  TrendingUp,
} from 'lucide-react';
import { CurrencyBadge } from './components/CurrencyBadge';
import { CalcOperator, Keypad } from './components/Keypad';
import {
  AddCurrencyModal,
  ChartModal,
  CustomRateModal,
  InstallAppModal,
} from './components/Modals';
import { RateHistoryChart } from './components/RateHistoryChart';
import {
  CURRENCY_MAP,
  DEFAULT_RATES_USD,
  DEFAULT_SELECTED_CODES,
  formatDisplayNumber,
  formatNumberToInput,
  formatRawInputString,
} from './data/currencies';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { usePWAInstall } from './hooks/usePWAInstall';

const STORAGE_KEY = 'conversor_plus_state_v5';

interface PersistedState {
  selectedCodes?: string[];
  activeCode?: string;
  baseRatesUsd?: Record<string, number>;
  customRatesUsd?: Record<string, number>;
  theme?: 'light' | 'dark';
}

interface ToastItem {
  id: number;
  message: string;
}

function loadPersistedState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PersistedState;
  } catch {
    return {};
  }
}

export default function App() {
  const initialSaved = useMemo(() => loadPersistedState(), []);

  const [selectedCodes, setSelectedCodes] = useState<string[]>(() =>
    Array.isArray(initialSaved.selectedCodes) && initialSaved.selectedCodes.length >= 2
      ? initialSaved.selectedCodes
      : DEFAULT_SELECTED_CODES
  );
  const [activeCode, setActiveCode] = useState<string>(() => {
    const list =
      Array.isArray(initialSaved.selectedCodes) && initialSaved.selectedCodes.length >= 2
        ? initialSaved.selectedCodes
        : DEFAULT_SELECTED_CODES;
    return initialSaved.activeCode && list.includes(initialSaved.activeCode)
      ? initialSaved.activeCode
      : 'USD';
  });
  const [baseRatesUsd, setBaseRatesUsd] = useState<Record<string, number>>(() => ({
    ...DEFAULT_RATES_USD,
    ...(initialSaved.baseRatesUsd || {}),
  }));
  const [customRatesUsd, setCustomRatesUsd] = useState<Record<string, number>>(
    () => initialSaved.customRatesUsd || {}
  );
  // Default dark mode matching the CONVERSOR PLUS update
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (initialSaved.theme === 'light' || initialSaved.theme === 'dark') {
      return initialSaved.theme;
    }
    return 'dark';
  });

  // Calculator state (default 548 matching update)
  const [inputString, setInputString] = useState<string>('548');
  const [pendingOperator, setPendingOperator] = useState<CalcOperator | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [resetOnNextDigit, setResetOnNextDigit] = useState<boolean>(false);
  const [keypadExpanded, setKeypadExpanded] = useState<boolean>(true);

  // Sync & UI state
  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Modals & Chart Pair
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showChartModal, setShowChartModal] = useState<boolean>(false);
  const [showCustomRateModal, setShowCustomRateModal] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [chartTargetCode, setChartTargetCode] = useState<string>('BRL');

  // Drag-reorder state
  const [draggingCode, setDraggingCode] = useState<string | null>(null);
  const [dragOverCode, setDragOverCode] = useState<string | null>(null);
  const suppressRowClickRef = useRef<boolean>(false);
  const listContainerRef = useRef<HTMLDivElement | null>(null);

  const showToast = useCallback((message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          selectedCodes,
          activeCode,
          baseRatesUsd,
          customRatesUsd,
          theme,
        })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [selectedCodes, activeCode, baseRatesUsd, customRatesUsd, theme]);

  useEffect(() => {
    if (chartTargetCode === activeCode || !selectedCodes.includes(chartTargetCode)) {
      const next = selectedCodes.find((c) => c !== activeCode) || 'BRL';
      setChartTargetCode(next);
    }
  }, [activeCode, selectedCodes, chartTargetCode]);

  const getEffectiveUsdRate = useCallback(
    (code: string) => customRatesUsd[code] ?? baseRatesUsd[code] ?? 1,
    [customRatesUsd, baseRatesUsd]
  );

  const activeNumericValue = useMemo(() => {
    const cleaned = inputString.replace(',', '.');
    const num = parseFloat(cleaned);
    return Number.isNaN(num) ? 0 : num;
  }, [inputString]);

  const fetchLiveRates = useCallback(
    async (manual = false) => {
      if (manual) setIsRefreshing(true);
      try {
        const [fiatRes, cryptoRes] = await Promise.all([
          fetch('https://open.er-api.com/v6/latest/USD'),
          fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,polygon-ecosystem-token,matic-network,tron,binancecoin&vs_currencies=usd'
          ),
        ]);

        const nextRates: Record<string, number> = {};

        if (fiatRes.ok) {
          const fiatData = await fiatRes.json();
          if (fiatData?.rates) {
            Object.keys(DEFAULT_RATES_USD).forEach((code) => {
              if (typeof fiatData.rates[code] === 'number' && fiatData.rates[code] > 0) {
                nextRates[code] = fiatData.rates[code];
              }
            });
          }
        }

        if (cryptoRes.ok) {
          const cryptoData = await cryptoRes.json();
          if (cryptoData.bitcoin?.usd) nextRates.BTC = 1 / cryptoData.bitcoin.usd;
          if (cryptoData.ethereum?.usd) nextRates.ETH = 1 / cryptoData.ethereum.usd;
          if (cryptoData.solana?.usd) nextRates.SOL = 1 / cryptoData.solana.usd;
          const polPrice =
            cryptoData['polygon-ecosystem-token']?.usd || cryptoData['matic-network']?.usd;
          if (polPrice) nextRates.POL = 1 / polPrice;
          if (cryptoData.tron?.usd) nextRates.TRX = 1 / cryptoData.tron.usd;
          if (cryptoData.binancecoin?.usd) nextRates.BNB = 1 / cryptoData.binancecoin.usd;
        }

        if (Object.keys(nextRates).length > 0) {
          setBaseRatesUsd((prev) => ({ ...prev, ...nextRates }));
          const now = new Date();
          const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const dateStr = now
            .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
            .replace(' de ', ' ')
            .replace('.', '');
          setLastUpdatedLabel(`Atualizado: ${timeStr}, ${dateStr}`);
          if (manual) showToast('Cotações atualizadas!');
        } else if (manual) {
          showToast('Sem conexão. Usando taxas salvas.');
        }
      } catch {
        if (manual) showToast('Sem conexão. Usando taxas salvas.');
      } finally {
        if (manual) {
          setTimeout(() => setIsRefreshing(false), 300);
        }
      }
    },
    [showToast]
  );

  useEffect(() => {
    fetchLiveRates(false);
    const id = setInterval(() => {
      fetchLiveRates(false);
    }, 30000);
    return () => clearInterval(id);
  }, [fetchLiveRates]);

  const computeOperation = (a: number, b: number, op: CalcOperator): number => {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      case '/':
        return b !== 0 ? a / b : 0;
    }
  };

  const handleDigit = useCallback(
    (digit: string) => {
      if (resetOnNextDigit) {
        setInputString(digit);
        setResetOnNextDigit(false);
      } else if (inputString === '0') {
        setInputString(digit);
      } else if (inputString.replace(',', '').length < 14) {
        setInputString((prev) => prev + digit);
      }
    },
    [inputString, resetOnNextDigit]
  );

  const handleDecimal = useCallback(() => {
    if (resetOnNextDigit) {
      setInputString('0,');
      setResetOnNextDigit(false);
    } else if (!inputString.includes(',')) {
      setInputString((prev) => prev + ',');
    }
  }, [inputString, resetOnNextDigit]);

  const handleBackspace = useCallback(() => {
    if (resetOnNextDigit) {
      setInputString('0');
      setResetOnNextDigit(false);
    } else if (inputString.length <= 1) {
      setInputString('0');
    } else {
      setInputString((prev) => prev.slice(0, -1));
    }
  }, [inputString, resetOnNextDigit]);

  const handleClear = useCallback(() => {
    setInputString('0');
    setPendingOperator(null);
    setPreviousValue(null);
    setResetOnNextDigit(false);
  }, []);

  const handleOperator = useCallback(
    (op: CalcOperator) => {
      if (pendingOperator && previousValue !== null && !resetOnNextDigit) {
        const evaluated = computeOperation(previousValue, activeNumericValue, pendingOperator);
        setPreviousValue(evaluated);
        setInputString(formatNumberToInput(evaluated));
      } else {
        setPreviousValue(activeNumericValue);
      }
      setPendingOperator(op);
      setResetOnNextDigit(true);
    },
    [pendingOperator, previousValue, resetOnNextDigit, activeNumericValue]
  );

  const handleEquals = useCallback(() => {
    if (!pendingOperator || previousValue === null) {
      setResetOnNextDigit(true);
      return;
    }
    const result = computeOperation(previousValue, activeNumericValue, pendingOperator);
    setInputString(formatNumberToInput(result));
    setPendingOperator(null);
    setPreviousValue(null);
    setResetOnNextDigit(true);
  }, [pendingOperator, previousValue, activeNumericValue]);

  const selectActiveCurrency = useCallback(
    (code: string) => {
      if (suppressRowClickRef.current || draggingCode) return;
      if (code === activeCode) {
        if (!keypadExpanded) setKeypadExpanded(true);
        return;
      }

      const fromUsdRate = getEffectiveUsdRate(activeCode);
      const toUsdRate = getEffectiveUsdRate(code);
      const converted =
        fromUsdRate > 0 ? (activeNumericValue / fromUsdRate) * toUsdRate : activeNumericValue;
      const info = CURRENCY_MAP[code] || { decimals: 2 };

      setActiveCode(code);
      setInputString(
        converted === 0
          ? '0'
          : Number(converted.toFixed(info.decimals)).toString().replace('.', ',')
      );
      setPendingOperator(null);
      setPreviousValue(null);
      setResetOnNextDigit(true);
    },
    [draggingCode, activeCode, keypadExpanded, getEffectiveUsdRate, activeNumericValue]
  );

  const handleSwapTopTwo = useCallback(() => {
    if (selectedCodes.length < 2) return;
    const [first, second, ...rest] = selectedCodes;
    setSelectedCodes([second, first, ...rest]);
    const nextActive = activeCode === first ? second : first;

    const fromUsdRate = getEffectiveUsdRate(activeCode);
    const toUsdRate = getEffectiveUsdRate(nextActive);
    const converted =
      fromUsdRate > 0 ? (activeNumericValue / fromUsdRate) * toUsdRate : activeNumericValue;
    const info = CURRENCY_MAP[nextActive] || { decimals: 2 };

    setActiveCode(nextActive);
    setInputString(
      converted === 0
        ? '0'
        : Number(converted.toFixed(info.decimals)).toString().replace('.', ',')
    );
    setPendingOperator(null);
    setPreviousValue(null);
    setResetOnNextDigit(true);
  }, [selectedCodes, activeCode, getEffectiveUsdRate, activeNumericValue]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      if (showAddModal || showChartModal || showCustomRateModal || showInstallModal) {
        if (e.key === 'Escape') {
          setShowAddModal(false);
          setShowChartModal(false);
          setShowCustomRateModal(false);
          setShowInstallModal(false);
        }
        return;
      }

      if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
      else if (e.key === ',' || e.key === '.') handleDecimal();
      else if (e.key === 'Backspace') handleBackspace();
      else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') handleClear();
      else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        handleOperator(e.key as CalcOperator);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    showAddModal,
    showChartModal,
    showCustomRateModal,
    showInstallModal,
    handleDigit,
    handleDecimal,
    handleBackspace,
    handleClear,
    handleOperator,
    handleEquals,
  ]);

  const handleToggleCurrency = (code: string) => {
    if (selectedCodes.includes(code)) {
      if (selectedCodes.length <= 2) {
        showToast('Mantenha pelo menos 2 moedas na lista.');
        return;
      }
      const filtered = selectedCodes.filter((c) => c !== code);
      setSelectedCodes(filtered);
      if (activeCode === code) {
        setActiveCode(filtered[0]);
      }
    } else {
      setSelectedCodes((prev) => [...prev, code]);
    }
  };

  const handleSaveCustomRate = (targetCode: string, unitValue: number) => {
    if (!Number.isFinite(unitValue) || unitValue <= 0) {
      showToast('Informe um valor válido maior que zero.');
      return;
    }
    const activeUsd = getEffectiveUsdRate(activeCode);
    setCustomRatesUsd((prev) => ({
      ...prev,
      [targetCode]: activeUsd * unitValue,
    }));
    setShowCustomRateModal(false);
    showToast(`Taxa manual aplicada para ${targetCode}!`);
  };

  const handleResetCustomRates = () => {
    setCustomRatesUsd({});
    setShowCustomRateModal(false);
    showToast('Taxas oficiais restauradas!');
  };

  const startRowDrag = (code: string, clientY: number) => {
    setDraggingCode(code);
    setDragOverCode(code);
    suppressRowClickRef.current = true;
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }

    const handleMove = (ev: PointerEvent) => {
      const y = ev.clientY ?? clientY;
      const container = listContainerRef.current;
      if (!container) return;
      const rows = Array.from(container.querySelectorAll<HTMLElement>('[data-currency-code]'));
      const hovered = rows.find((row) => {
        const rect = row.getBoundingClientRect();
        return y >= rect.top && y <= rect.bottom;
      });
      if (hovered?.dataset.currencyCode) {
        setDragOverCode(hovered.dataset.currencyCode);
      }
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);

      setDragOverCode((latestTarget) => {
        if (latestTarget && latestTarget !== code) {
          setSelectedCodes((prev) => {
            const fromIdx = prev.indexOf(code);
            const toIdx = prev.indexOf(latestTarget);
            if (fromIdx === -1 || toIdx === -1) return prev;
            const copy = [...prev];
            copy.splice(fromIdx, 1);
            copy.splice(toIdx, 0, code);
            return copy;
          });
          showToast(`${code} movido!`);
        }
        return null;
      });

      setDraggingCode(null);
      setTimeout(() => {
        suppressRowClickRef.current = false;
      }, 120);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
  };

  const activeUsdRate = getEffectiveUsdRate(activeCode);
  const valueInUsd = activeUsdRate > 0 ? activeNumericValue / activeUsdRate : 0;
  const chartUnitRate = activeUsdRate > 0 ? getEffectiveUsdRate(chartTargetCode) / activeUsdRate : 1;

  const opLabels: Record<CalcOperator, string> = {
    '+': '+',
    '-': '−',
    '*': '×',
    '/': '÷',
  };

  const statusText = !isOnline
    ? 'Modo Offline · Taxas salvas no aparelho'
    : isRefreshing
    ? 'Atualizando cotações...'
    : lastUpdatedLabel || 'Atualizado agora · Toque para atualizar';

  return (
    <div className="h-[100dvh] lg:min-h-screen lg:h-auto bg-slate-200 dark:bg-[#0d0d0d] text-slate-900 dark:text-[#f2f2f2] flex flex-col overflow-hidden lg:overflow-visible">
      {/* Toast Notifications */}
      <div
        aria-live="polite"
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 max-w-xs w-full pointer-events-none px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-[#252525] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg border border-[#383838] text-center"
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* TOP BAR CLEAN & ROBUSTA */}
      <header className="bg-slate-100 dark:bg-[#1e1e1e] text-slate-900 dark:text-white shrink-0 z-20 border-b border-slate-200 dark:border-[#282828]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setShowInstallModal(true)}
            aria-label="Menu e instalação do aplicativo"
            title="Baixar Aplicativo"
            className="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-bold text-base sm:text-lg tracking-wide whitespace-nowrap">
              CONVERSOR <span className="font-normal">PLUS</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {!isInstalled && (
              <button
                type="button"
                onClick={() => setShowInstallModal(true)}
                className="px-3 py-1.5 min-h-[36px] rounded-xl bg-[#4f86c6] hover:bg-[#5c94d6] text-white text-xs font-bold transition cursor-pointer whitespace-nowrap"
              >
                Baixar
              </button>
            )}
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              aria-label="Alternar tema Claro/Escuro"
              title="Alternar tema"
              className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 min-h-0 flex flex-col lg:max-w-6xl lg:w-full lg:mx-auto lg:px-6 lg:py-6 lg:grid lg:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_410px] lg:gap-6 lg:items-start">
        {/* LEFT COLUMN: Status + Simultaneous List + Manage Button */}
        <section className="flex-1 min-h-0 flex flex-col bg-white dark:bg-[#141414] lg:rounded-2xl lg:border lg:border-slate-200 dark:lg:border-[#282828] lg:shadow-sm lg:overflow-hidden">
          {/* Clickable Status Bar */}
          <button
            type="button"
            onClick={() => fetchLiveRates(true)}
            className="w-full bg-slate-50 dark:bg-[#141414] text-slate-500 dark:text-[#9e9e9e] text-xs sm:text-[13px] font-medium py-2.5 px-4 text-center border-b border-slate-200/70 dark:border-[#222222] hover:text-[#4f86c6] transition cursor-pointer shrink-0"
          >
            {statusText}
          </button>

          {/* Pending Calculator Expression Banner */}
          {pendingOperator && previousValue !== null && (
            <div className="bg-sky-50 dark:bg-[#1d2733] border-b border-sky-200 dark:border-[#2b3b4e] px-4 py-2 flex items-center justify-between text-sm shrink-0">
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Conta (<strong className="text-slate-900 dark:text-white">{activeCode}</strong>):
              </span>
              <span className="font-mono-tabular font-bold text-base text-sky-600 dark:text-[#6aa3e8]">
                {formatDisplayNumber(previousValue, 4)} {opLabels[pendingOperator]} {inputString}
              </span>
            </div>
          )}

          {/* Currency Rows */}
          <div
            ref={listContainerRef}
            className="flex-1 overflow-y-auto currency-scroll divide-y divide-slate-200 dark:divide-[#232323]"
          >
            {selectedCodes.map((code) => {
              const info = CURRENCY_MAP[code] || {
                code,
                name: code,
                symbol: '$',
                decimals: 2,
              };
              const isActive = code === activeCode;
              const targetUsdRate = getEffectiveUsdRate(code);
              const isCustom = Boolean(customRatesUsd[code]);
              const isDragging = draggingCode === code;
              const isDragTarget = dragOverCode === code && draggingCode && draggingCode !== code;

              const displayValueStr = isActive
                ? formatRawInputString(inputString)
                : formatDisplayNumber(valueInUsd * targetUsdRate, info.decimals);

              let pressTimer: number | null = null;

              return (
                <div
                  key={code}
                  data-currency-code={code}
                  onClick={() => selectActiveCurrency(code)}
                  onPointerDown={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('button')) return;
                    const startY = e.clientY;
                    pressTimer = window.setTimeout(() => {
                      startRowDrag(code, startY);
                    }, 240);
                    const cancelLongPress = (moveEv: PointerEvent) => {
                      if (Math.abs(moveEv.clientY - startY) > 8 && pressTimer) {
                        clearTimeout(pressTimer);
                        pressTimer = null;
                      }
                    };
                    const clearLongPress = () => {
                      if (pressTimer) {
                        clearTimeout(pressTimer);
                        pressTimer = null;
                      }
                      window.removeEventListener('pointermove', cancelLongPress);
                      window.removeEventListener('pointerup', clearLongPress);
                      window.removeEventListener('pointercancel', clearLongPress);
                    };
                    window.addEventListener('pointermove', cancelLongPress);
                    window.addEventListener('pointerup', clearLongPress);
                    window.addEventListener('pointercancel', clearLongPress);
                  }}
                  className={`px-4 py-3.5 min-h-[64px] flex items-center justify-between gap-3 cursor-pointer select-none transition-colors duration-150 ${
                    isDragging
                      ? 'bg-sky-100 dark:bg-[#253242] scale-[1.015] shadow-lg relative z-20'
                      : isActive
                      ? 'bg-sky-50/80 dark:bg-[#1f2936]'
                      : 'hover:bg-slate-50 dark:hover:bg-[#1a1a1a]'
                  } ${isDragTarget ? 'border-t-2 border-t-[#4f86c6]' : ''}`}
                >
                  {/* Left: Flag/Crypto + Large Code + Chevron */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <CurrencyBadge info={info} size="md" />
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xl sm:text-[22px] font-medium tracking-wide text-slate-900 dark:text-[#f2f2f2]">
                        {info.code}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-300 shrink-0" />
                      {isCustom && (
                        <span className="text-[11px] font-semibold text-amber-500 ml-1">
                          · Manual
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Large Tabular Amount + Chart Trigger */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {isActive ? (
                      <span className="px-2.5 py-0.5 rounded-[4px] bg-[#4b6a8e] text-white font-mono-tabular text-2xl sm:text-[26px] font-normal tracking-tight leading-snug">
                        {displayValueStr}
                      </span>
                    ) : (
                      <span className="font-mono-tabular text-2xl sm:text-[26px] font-normal tracking-tight text-slate-900 dark:text-[#ececec]">
                        {displayValueStr}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const pairTarget =
                          code === activeCode
                            ? selectedCodes.find((c) => c !== activeCode) || 'BRL'
                            : code;
                        setChartTargetCode(pairTarget);
                        if (window.innerWidth < 1024) {
                          setShowChartModal(true);
                        }
                      }}
                      aria-label={`Ver gráfico ${activeCode}/${code}`}
                      title={`Ver gráfico ${activeCode}/${code}`}
                      className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-[#4f86c6] transition cursor-pointer"
                    >
                      <TrendingUp className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Manage Currencies & Collapse Button Row */}
          <div className="px-4 py-2.5 bg-white dark:bg-[#141414] border-t border-slate-200/70 dark:border-[#222222] shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex-1 py-2.5 px-4 min-h-[44px] rounded-xl bg-slate-100 dark:bg-[#232323] hover:bg-slate-200 dark:hover:bg-[#2c2c2c] border border-slate-200 dark:border-[#303030] text-slate-800 dark:text-[#ececec] font-medium text-base flex items-center justify-center gap-2.5 transition shadow-xs cursor-pointer"
            >
              <ListPlus className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              <span>Gerenciar moedas</span>
            </button>
            <button
              type="button"
              onClick={() => setKeypadExpanded((prev) => !prev)}
              aria-label="Recolher ou expandir teclado"
              title="Recolher / Expandir teclado"
              className="lg:hidden py-2.5 px-3.5 min-h-[44px] rounded-xl bg-slate-100 dark:bg-[#232323] hover:bg-slate-200 dark:hover:bg-[#2c2c2c] border border-slate-200 dark:border-[#303030] text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-200 ${
                  keypadExpanded ? 'rotate-0' : 'rotate-180'
                }`}
              />
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN (DESKTOP) / COLLAPSIBLE DRAWER (MOBILE) */}
        <aside className="shrink-0 lg:space-y-4">
          <div
            className={`lg:block lg:rounded-2xl lg:border lg:border-slate-200 dark:lg:border-[#282828] lg:shadow-sm lg:overflow-hidden transition-[max-height,opacity] duration-200 overflow-hidden ${
              keypadExpanded ? 'max-h-[360px] opacity-100' : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100'
            }`}
          >
            <div className="hidden lg:flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#1e1e1e] border-b border-slate-200 dark:border-[#282828]">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Calculadora ({activeCode})
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowCustomRateModal(true)}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#4f86c6] flex items-center gap-1 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Minha taxa</span>
                </button>
                <button
                  type="button"
                  onClick={handleEquals}
                  className="px-2.5 py-1 rounded-lg bg-[#e09f5a] text-[#141414] text-xs font-bold hover:opacity-90 cursor-pointer"
                >
                  Calcular (=)
                </button>
              </div>
            </div>
            <Keypad
              onDigit={handleDigit}
              onDecimal={handleDecimal}
              onBackspace={handleBackspace}
              onClear={handleClear}
              onOperator={handleOperator}
              onSwapTopTwo={handleSwapTopTwo}
              onToggleCollapse={() => setKeypadExpanded((prev) => !prev)}
              activeOperator={pendingOperator}
            />
          </div>

          {/* Desktop Inline Historical Chart Card */}
          <div className="hidden lg:block bg-white dark:bg-[#1e1e1e] rounded-2xl border border-slate-200 dark:border-[#282828] shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Histórico {activeCode} → {chartTargetCode}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Toque no ícone de gráfico em qualquer moeda
                </p>
              </div>
              <select
                aria-label="Selecionar moeda do gráfico"
                value={chartTargetCode}
                onChange={(e) => setChartTargetCode(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#141414] border border-slate-200 dark:border-[#303030] text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#4f86c6]"
              >
                {selectedCodes
                  .filter((c) => c !== activeCode)
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </div>
            <RateHistoryChart
              fromCode={activeCode}
              toCode={chartTargetCode}
              currentRate={chartUnitRate}
              isOnline={isOnline}
            />
          </div>
        </aside>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="lg:hidden bg-white dark:bg-[#1a1a1a] border-t border-slate-200 dark:border-[#292929] px-2 py-1.5 grid grid-cols-4 text-xs font-medium shrink-0 z-20">
        <button
          type="button"
          onClick={() => {
            setShowAddModal(false);
            setShowChartModal(false);
            setShowCustomRateModal(false);
            setShowInstallModal(false);
          }}
          className="flex flex-col items-center justify-center gap-1 py-1 min-h-[44px] rounded-xl text-[#4f86c6] cursor-pointer"
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span>Conversor</span>
        </button>
        <button
          type="button"
          onClick={() => setShowChartModal(true)}
          className="flex flex-col items-center justify-center gap-1 py-1 min-h-[44px] rounded-xl text-slate-500 dark:text-[#9a9a9a] hover:text-[#4f86c6] transition cursor-pointer"
        >
          <TrendingUp className="w-5 h-5" />
          <span>Gráficos</span>
        </button>
        <button
          type="button"
          onClick={handleEquals}
          className="flex flex-col items-center justify-center gap-1 py-1 min-h-[44px] rounded-xl text-[#e09f5a] hover:opacity-80 transition font-bold cursor-pointer"
        >
          <Equal className="w-5 h-5" />
          <span>Calcular (=)</span>
        </button>
        <button
          type="button"
          onClick={() => setShowCustomRateModal(true)}
          className="flex flex-col items-center justify-center gap-1 py-1 min-h-[44px] rounded-xl text-slate-500 dark:text-[#9a9a9a] hover:text-[#4f86c6] transition cursor-pointer"
        >
          <Pencil className="w-5 h-5" />
          <span>Minha taxa</span>
        </button>
      </nav>

      {/* MODALS */}
      <AddCurrencyModal
        open={showAddModal}
        selectedCodes={selectedCodes}
        onClose={() => setShowAddModal(false)}
        onToggleCurrency={handleToggleCurrency}
      />

      <ChartModal
        open={showChartModal}
        fromCode={activeCode}
        toCode={chartTargetCode}
        currentRate={chartUnitRate}
        isOnline={isOnline}
        onClose={() => setShowChartModal(false)}
      />

      <CustomRateModal
        open={showCustomRateModal}
        activeCode={activeCode}
        selectedCodes={selectedCodes}
        getEffectiveRate={getEffectiveUsdRate}
        onClose={() => setShowCustomRateModal(false)}
        onSaveCustomRate={handleSaveCustomRate}
        onResetCustomRates={handleResetCustomRates}
      />

      <InstallAppModal
        open={showInstallModal}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isIOS={isIOS}
        onClose={() => setShowInstallModal(false)}
        onTriggerInstall={async () => {
          const accepted = await install();
          if (accepted) {
            showToast('Aplicativo instalado na tela inicial!');
            setShowInstallModal(false);
          }
        }}
      />
    </div>
  );
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeftRight,
  Calculator,
  ChevronDown,
  Download,
  GripVertical,
  LineChart,
  Moon,
  Percent,
  Plus,
  RefreshCw,
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
  formatUnitRate,
} from './data/currencies';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { usePWAInstall } from './hooks/usePWAInstall';

const STORAGE_KEY = 'conversor_plus_state_v4';

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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (initialSaved.theme === 'dark' || initialSaved.theme === 'light') {
      return initialSaved.theme;
    }
    return 'light';
  });

  // Calculator state
  const [inputString, setInputString] = useState<string>('100');
  const [pendingOperator, setPendingOperator] = useState<CalcOperator | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [resetOnNextDigit, setResetOnNextDigit] = useState<boolean>(false);
  const [keypadExpanded, setKeypadExpanded] = useState<boolean>(true);

  // Sync & UI state
  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string | null>(null);
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
    }, 2600);
  }, []);

  // Sync dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Persist to localStorage
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

  // Ensure chartTargetCode stays valid and distinct from activeCode
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
          const nowStr = new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          setLastUpdatedTime(nowStr);
          if (manual) showToast('Cotações atualizadas em tempo real!');
        } else if (manual) {
          showToast('Sem conexão. Usando últimas taxas salvas.');
        }
      } catch {
        if (manual) showToast('Sem conexão. Usando últimas taxas salvas.');
      } finally {
        if (manual) {
          setTimeout(() => setIsRefreshing(false), 350);
        }
      }
    },
    [showToast]
  );

  // Initial fetch & 30s live polling
  useEffect(() => {
    fetchLiveRates(false);
    const id = setInterval(() => {
      fetchLiveRates(false);
    }, 30000);
    return () => clearInterval(id);
  }, [fetchLiveRates]);

  // Math operations
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

  const handlePercent = useCallback(() => {
    let result = activeNumericValue / 100;
    if (pendingOperator && previousValue !== null) {
      result = (previousValue * activeNumericValue) / 100;
    }
    setInputString(formatNumberToInput(result));
    setResetOnNextDigit(false);
    showToast('Porcentagem aplicada');
  }, [activeNumericValue, pendingOperator, previousValue, showToast]);

  const selectActiveCurrency = useCallback(
    (code: string) => {
      if (suppressRowClickRef.current || draggingCode) return;
      if (code === activeCode) {
        if (!keypadExpanded) setKeypadExpanded(true);
        return;
      }

      const fromUsdRate = getEffectiveUsdRate(activeCode);
      const toUsdRate = getEffectiveUsdRate(code);
      const converted = fromUsdRate > 0 ? (activeNumericValue / fromUsdRate) * toUsdRate : activeNumericValue;
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
    const nextOrder = [second, first, ...rest];
    setSelectedCodes(nextOrder);
    const nextActive = activeCode === first ? second : first;

    const fromUsdRate = getEffectiveUsdRate(activeCode);
    const toUsdRate = getEffectiveUsdRate(nextActive);
    const converted = fromUsdRate > 0 ? (activeNumericValue / fromUsdRate) * toUsdRate : activeNumericValue;
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

  // Physical keyboard support
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
      } else if (e.key === '%') {
        handlePercent();
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
    handlePercent,
  ]);

  // Toggle currency in modal
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

  // Custom rate actions
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

  // Drag & Drop pointer reordering (supports touch handle, mouse handle, and long-press anywhere)
  const startRowDrag = (code: string, clientY: number) => {
    setDraggingCode(code);
    setDragOverCode(code);
    suppressRowClickRef.current = true;
    if (navigator.vibrate) {
      navigator.vibrate(20);
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
          showToast(`${code} movido na lista!`);
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

  const syncLabel = !isOnline
    ? 'Modo Offline · Taxas salvas'
    : lastUpdatedTime
    ? `Ao vivo · ${lastUpdatedTime}`
    : 'Taxas ao vivo · Offline pronto';

  return (
    <div className="h-[100dvh] lg:min-h-screen lg:h-auto bg-slate-100 dark:bg-[#0d1118] text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden lg:overflow-visible">
      {/* Toast Notifications */}
      <div
        aria-live="polite"
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 max-w-xs w-full pointer-events-none px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-slate-900/95 dark:bg-slate-800 text-white text-xs font-medium px-3.5 py-2.5 rounded-xl shadow-lg border border-slate-700 text-center"
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* TOP BAR */}
      <header className="bg-[#2b6cb0] dark:bg-[#1a2232] text-white shrink-0 shadow-sm z-20">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-100 p-1 flex flex-col justify-between shadow-inner shrink-0">
              <div className="bg-sky-400 text-[7px] font-mono-tabular font-extrabold text-slate-900 text-right px-0.5 rounded-[2px] leading-tight">
                100
              </div>
              <div className="grid grid-cols-3 gap-[1.5px] h-4">
                <div className="bg-slate-300 rounded-[1px] text-[6px] text-slate-700 flex items-center justify-center font-bold">
                  $
                </div>
                <div className="bg-slate-300 rounded-[1px] text-[6px] text-slate-700 flex items-center justify-center font-bold">
                  €
                </div>
                <div className="row-span-2 bg-orange-500 rounded-[1px] text-[7px] text-white flex items-center justify-center font-bold">
                  =
                </div>
                <div className="bg-slate-300 rounded-[1px] text-[6px] text-slate-700 flex items-center justify-center font-bold">
                  £
                </div>
                <div className="bg-slate-300 rounded-[1px] text-[6px] text-slate-700 flex items-center justify-center font-bold">
                  ¥
                </div>
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm sm:text-base leading-tight tracking-tight truncate">
                Conversor de Moedas Plus
              </h1>
              <p className="text-[11px] text-sky-100/90 dark:text-slate-400 truncate">
                {syncLabel}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {!isInstalled && (
              <button
                type="button"
                onClick={() => setShowInstallModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold shadow-xs transition cursor-pointer whitespace-nowrap"
                title="Instalar aplicativo no celular ou desktop"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">Baixar App</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => fetchLiveRates(true)}
              aria-label="Atualizar cotações"
              title="Atualizar cotações"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl hover:bg-white/15 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              aria-label="Gerenciar moedas"
              title="Adicionar ou remover moedas"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl hover:bg-white/15 transition cursor-pointer"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
              aria-label="Alternar tema Claro/Escuro"
              title="Alternar tema Claro/Escuro"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl hover:bg-white/15 transition cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE: Mobile single-column full-height | Desktop 2-column grid */}
      <main className="flex-1 min-h-0 flex flex-col lg:max-w-6xl lg:w-full lg:mx-auto lg:px-6 lg:py-6 lg:grid lg:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_410px] lg:gap-6 lg:items-start">
        {/* LEFT COLUMN: Simultaneous Currency List */}
        <section className="flex-1 min-h-0 flex flex-col bg-white dark:bg-[#12161f] lg:rounded-2xl lg:border lg:border-slate-200 dark:lg:border-slate-800 lg:shadow-sm lg:overflow-hidden">
          {/* Desktop Section Header */}
          <div className="hidden lg:flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#161b26]">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Conversão Simultânea
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Toque para definir a moeda base · Arraste para reordenar
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCustomRateModal(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Minha Taxa</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#2b6cb0] hover:bg-[#235a96] transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Moedas</span>
              </button>
            </div>
          </div>

          {/* Pending Calculator Expression Banner (Mobile + Desktop) */}
          {pendingOperator && previousValue !== null && (
            <div className="bg-sky-50 dark:bg-slate-900/90 border-b border-sky-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>
                  Conta em <strong className="text-slate-900 dark:text-slate-100">{activeCode}</strong>
                </span>
              </span>
              <span className="font-mono-tabular font-bold text-sky-700 dark:text-sky-400">
                {formatDisplayNumber(previousValue, 4)} {opLabels[pendingOperator]} {inputString}
              </span>
            </div>
          )}

          {/* Currency Rows */}
          <div
            ref={listContainerRef}
            className="flex-1 overflow-y-auto currency-scroll divide-y divide-slate-200/80 dark:divide-slate-800/80"
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
              const unitRate = activeUsdRate > 0 ? targetUsdRate / activeUsdRate : 1;
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
                    if (target.closest('[data-drag-handle]')) {
                      e.preventDefault();
                      startRowDrag(code, e.clientY);
                    } else {
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
                    }
                  }}
                  className={`px-3 sm:px-4 py-3 min-h-[64px] flex items-center justify-between gap-2.5 cursor-pointer select-none transition-colors duration-150 ${
                    isDragging
                      ? 'bg-sky-100/90 dark:bg-sky-900/60 scale-[1.01] shadow-lg relative z-20'
                      : isActive
                      ? 'bg-sky-50/90 dark:bg-sky-950/35 ring-1 ring-inset ring-sky-500/35'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                  } ${isDragTarget ? 'border-t-2 border-t-sky-600' : ''}`}
                >
                  {/* Left: Drag Handle + Flag/Crypto + Code + Name */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      data-drag-handle
                      title="Segure e arraste para reordenar"
                      className="touch-none p-1.5 -ml-1 text-slate-300 dark:text-slate-600 hover:text-sky-600 dark:hover:text-sky-400 cursor-grab active:cursor-grabbing shrink-0"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <CurrencyBadge info={info} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold text-sm sm:text-[15px] ${
                            isActive
                              ? 'text-sky-700 dark:text-sky-300'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {info.code}
                        </span>
                        <span className="text-[11px] font-mono-tabular text-slate-400 dark:text-slate-500">
                          · {info.symbol}
                        </span>
                        {isCustom && (
                          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                            · Taxa manual
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {info.name}
                      </p>
                    </div>
                  </div>

                  {/* Right: Value + Unit Rate + Chart Trigger */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="text-right">
                      <div
                        className={`font-mono-tabular text-lg sm:text-xl font-bold tracking-tight flex items-baseline justify-end gap-1 ${
                          isActive
                            ? 'text-sky-700 dark:text-sky-300'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-semibold opacity-65">
                          {info.symbol}
                        </span>
                        <span>{displayValueStr}</span>
                      </div>
                      <div className="text-[11px] font-mono-tabular text-slate-500 dark:text-slate-400">
                        {isActive
                          ? 'Moeda base ativa'
                          : `1 ${activeCode} = ${formatUnitRate(unitRate)} ${code}`}
                      </div>
                    </div>

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
                      className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <LineChart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RIGHT COLUMN (DESKTOP) / COLLAPSIBLE DRAWER (MOBILE) */}
        <aside className="shrink-0 lg:space-y-4">
          {/* Mobile Collapse Bar */}
          <div className="lg:hidden bg-slate-100 dark:bg-[#181e2c] border-t border-slate-200 dark:border-slate-800 px-3 py-1 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setKeypadExpanded((prev) => !prev)}
              className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:opacity-80 transition py-1.5 px-2 rounded-lg cursor-pointer"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  keypadExpanded ? 'rotate-0' : 'rotate-180'
                }`}
              />
              <span>
                {keypadExpanded
                  ? 'Recolher teclado (ver mais moedas)'
                  : 'Abrir teclado numérico'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-600 flex items-center gap-1 px-2 py-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Moeda</span>
            </button>
          </div>

          {/* Calculator Keypad */}
          <div
            className={`lg:block lg:rounded-2xl lg:border lg:border-slate-200 dark:lg:border-slate-800 lg:shadow-sm lg:overflow-hidden transition-[max-height,opacity] duration-200 overflow-hidden ${
              keypadExpanded ? 'max-h-[360px] opacity-100' : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100'
            }`}
          >
            <div className="hidden lg:flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#12161f] border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Calculadora ({activeCode})
              </span>
              <button
                type="button"
                onClick={handlePercent}
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Desconto %</span>
              </button>
            </div>
            <Keypad
              onDigit={handleDigit}
              onDecimal={handleDecimal}
              onBackspace={handleBackspace}
              onClear={handleClear}
              onOperator={handleOperator}
              onEquals={handleEquals}
              onSwapTopTwo={handleSwapTopTwo}
              activeOperator={pendingOperator}
            />
          </div>

          {/* Desktop Inline Historical Chart Card */}
          <div className="hidden lg:block bg-white dark:bg-[#12161f] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Histórico {activeCode} → {chartTargetCode}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Clique no ícone de gráfico em qualquer moeda
                </p>
              </div>
              <select
                aria-label="Selecionar moeda do gráfico"
                value={chartTargetCode}
                onChange={(e) => setChartTargetCode(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500"
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
      <nav className="lg:hidden bg-white dark:bg-[#12161f] border-t border-slate-200 dark:border-slate-800 px-2 py-1 grid grid-cols-4 text-[11px] font-semibold shrink-0 z-20">
        <button
          type="button"
          onClick={() => {
            setShowAddModal(false);
            setShowChartModal(false);
            setShowCustomRateModal(false);
            setShowInstallModal(false);
          }}
          className="flex flex-col items-center justify-center gap-0.5 py-1.5 min-h-[44px] rounded-xl text-sky-600 dark:text-sky-400 cursor-pointer"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Converter</span>
        </button>
        <button
          type="button"
          onClick={() => setShowChartModal(true)}
          className="flex flex-col items-center justify-center gap-0.5 py-1.5 min-h-[44px] rounded-xl text-slate-500 dark:text-slate-400 hover:text-sky-600 transition cursor-pointer"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Gráficos</span>
        </button>
        <button
          type="button"
          onClick={() => setShowCustomRateModal(true)}
          className="flex flex-col items-center justify-center gap-0.5 py-1.5 min-h-[44px] rounded-xl text-slate-500 dark:text-slate-400 hover:text-sky-600 transition cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Minha Taxa</span>
        </button>
        <button
          type="button"
          onClick={handlePercent}
          className="flex flex-col items-center justify-center gap-0.5 py-1.5 min-h-[44px] rounded-xl text-slate-500 dark:text-slate-400 hover:text-sky-600 transition cursor-pointer"
        >
          <Percent className="w-4 h-4" />
          <span>Desconto %</span>
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

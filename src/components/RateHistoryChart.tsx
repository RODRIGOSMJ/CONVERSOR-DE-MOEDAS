import React, { useEffect, useMemo, useState } from 'react';
import { CURRENCY_MAP, formatUnitRate } from '../data/currencies';

interface HistoryPoint {
  dateLabel: string;
  rate: number;
}

interface RateHistoryChartProps {
  fromCode: string;
  toCode: string;
  currentRate: number;
  isOnline: boolean;
}

const FRANKFURTER_SUPPORTED = new Set([
  'USD',
  'EUR',
  'BRL',
  'GBP',
  'CAD',
  'AUD',
  'JPY',
  'CHF',
  'MXN',
  'CNY',
]);

const PERIODS = [
  { label: '7D', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1A', days: 365 },
] as const;

function buildFallbackSeries(currentRate: number, days: number, pairKey: string): HistoryPoint[] {
  const pointsCount = Math.min(days, 24);
  const result: HistoryPoint[] = [];
  // Deterministic seed from pairKey so switching tabs doesn't randomly flicker
  let seed = 0;
  for (let i = 0; i < pairKey.length; i++) {
    seed = (seed * 31 + pairKey.charCodeAt(i)) % 1000;
  }

  let simulated = currentRate * (0.96 + (seed % 7) * 0.01);
  for (let i = pointsCount; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - Math.round((i * days) / pointsCount));
    const dateLabel = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    if (i === 0) {
      result.push({ dateLabel, rate: currentRate });
    } else {
      const drift = (currentRate - simulated) * 0.18;
      const wave = Math.sin(i * 1.15 + seed) * (currentRate * 0.012);
      simulated = Math.max(simulated + drift + wave, currentRate * 0.5);
      result.push({ dateLabel, rate: simulated });
    }
  }
  return result;
}

export const RateHistoryChart: React.FC<RateHistoryChartProps> = ({
  fromCode,
  toCode,
  currentRate,
  isOnline,
}) => {
  const [days, setDays] = useState<number>(7);
  const [points, setPoints] = useState<HistoryPoint[]>(() =>
    buildFallbackSeries(currentRate, 7, `${fromCode}-${toCode}`)
  );
  const [isRealData, setIsRealData] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const pairKey = `${fromCode}-${toCode}`;

    async function loadHistory() {
      setHoverIdx(null);

      if (!isOnline || fromCode === toCode) {
        setPoints(buildFallbackSeries(currentRate, days, pairKey));
        setIsRealData(false);
        return;
      }

      const fromInfo = CURRENCY_MAP[fromCode];
      const toInfo = CURRENCY_MAP[toCode];

      // 1) Try Frankfurter for supported fiat pairs
      if (FRANKFURTER_SUPPORTED.has(fromCode) && FRANKFURTER_SUPPORTED.has(toCode)) {
        setLoading(true);
        try {
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(endDate.getDate() - days);
          const fmt = (d: Date) => d.toISOString().slice(0, 10);
          const res = await fetch(
            `https://api.frankfurter.app/${fmt(startDate)}..${fmt(endDate)}?from=${fromCode}&to=${toCode}`
          );
          if (res.ok) {
            const json = await res.json();
            if (!cancelled && json?.rates) {
              const entries = Object.entries(json.rates as Record<string, Record<string, number>>);
              const parsed: HistoryPoint[] = entries
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([iso, val]) => {
                  const [y, m, d] = iso.split('-');
                  return {
                    dateLabel: `${d}/${m}`,
                    rate: val[toCode] ?? currentRate,
                    _y: y,
                  };
                });
              if (parsed.length >= 2) {
                setPoints(parsed);
                setIsRealData(true);
                setLoading(false);
                return;
              }
            }
          }
        } catch {
          // fall through to fallback
        }
        if (!cancelled) setLoading(false);
      }

      // 2) Try CoinGecko when one side is crypto and the other is USD
      const isFromCrypto = Boolean(fromInfo?.coingeckoId);
      const isToCrypto = Boolean(toInfo?.coingeckoId);
      if ((isFromCrypto && toCode === 'USD') || (isToCrypto && fromCode === 'USD')) {
        const coinId = isFromCrypto ? fromInfo?.coingeckoId : toInfo?.coingeckoId;
        if (coinId) {
          setLoading(true);
          try {
            const res = await fetch(
              `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
            );
            if (res.ok) {
              const json = await res.json();
              const prices: [number, number][] = json?.prices ?? [];
              if (!cancelled && prices.length >= 2) {
                const step = Math.max(1, Math.floor(prices.length / 28));
                const sampled = prices.filter((_, idx) => idx % step === 0 || idx === prices.length - 1);
                const parsed: HistoryPoint[] = sampled.map(([ts, usdPrice]) => {
                  const d = new Date(ts);
                  const dateLabel = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                  const rate = isFromCrypto ? usdPrice : usdPrice > 0 ? 1 / usdPrice : 0;
                  return { dateLabel, rate };
                });
                setPoints(parsed);
                setIsRealData(true);
                setLoading(false);
                return;
              }
            }
          } catch {
            // fall through
          }
          if (!cancelled) setLoading(false);
        }
      }

      if (!cancelled) {
        setPoints(buildFallbackSeries(currentRate, days, pairKey));
        setIsRealData(false);
      }
    }

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [fromCode, toCode, days, currentRate, isOnline]);

  const stats = useMemo(() => {
    const values = points.map((p) => p.rate);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const first = values[0] || currentRate;
    const last = values[values.length - 1] || currentRate;
    const pct = first > 0 ? ((last - first) / first) * 100 : 0;
    return { min, max, first, last, pct };
  }, [points, currentRate]);

  // SVG dimensions
  const width = 360;
  const height = 160;
  const padX = 8;
  const padY = 14;

  const { linePath, areaPath, coords } = useMemo(() => {
    const minVal = stats.min;
    const maxVal = stats.max;
    const range = maxVal - minVal || maxVal * 0.02 || 1;

    const pts = points.map((p, idx) => {
      const x =
        points.length === 1
          ? width / 2
          : padX + (idx / (points.length - 1)) * (width - padX * 2);
      const y =
        height - padY - ((p.rate - minVal) / range) * (height - padY * 2);
      return { x, y, ...p };
    });

    const line = pts
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
      .join(' ');

    const area =
      pts.length > 0
        ? `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${height} L ${pts[0].x.toFixed(1)} ${height} Z`
        : '';

    return { linePath: line, areaPath: area, coords: pts };
  }, [points, stats]);

  const activePoint = hoverIdx !== null && coords[hoverIdx] ? coords[hoverIdx] : coords[coords.length - 1];
  const isPositive = stats.pct >= 0;

  return (
    <div className="space-y-3">
      {/* Period Selector + Source */}
      <div className="flex items-center justify-between gap-2">
        <div className="grid grid-cols-4 gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-semibold flex-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              onClick={() => setDays(p.days)}
              className={`py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                days === p.days
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
          {loading ? 'Carregando...' : isRealData ? 'Mercado real' : 'Referência'}
        </span>
      </div>

      {/* Highlighted hovered/latest point */}
      <div className="flex items-baseline justify-between gap-2 px-1">
        <div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            1 {fromCode} em {toCode} ({activePoint?.dateLabel || 'Hoje'})
          </div>
          <div className="text-lg font-bold font-mono-tabular text-slate-900 dark:text-white">
            {formatUnitRate(activePoint?.rate ?? currentRate)} {toCode}
          </div>
        </div>
        <div
          className={`text-xs font-bold font-mono-tabular ${
            isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {isPositive ? '+' : ''}
          {stats.pct.toFixed(2).replace('.', ',')}% ({PERIODS.find((p) => p.days === days)?.label})
        </div>
      </div>

      {/* Interactive SVG Area Chart */}
      <div className="relative h-40 w-full rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full touch-none"
          onMouseLeave={() => setHoverIdx(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const idx = Math.round(relX * (coords.length - 1));
            setHoverIdx(idx);
          }}
          onTouchMove={(e) => {
            if (!e.touches[0]) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = Math.max(0, Math.min(1, (e.touches[0].clientX - rect.left) / rect.width));
            const idx = Math.round(relX * (coords.length - 1));
            setHoverIdx(idx);
          }}
        >
          <defs>
            <linearGradient id="rateAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {areaPath && <path d={areaPath} fill="url(#rateAreaFill)" />}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.4"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          )}
          {activePoint && (
            <>
              <line
                x1={activePoint.x}
                y1={0}
                x2={activePoint.x}
                y2={height}
                stroke="#0284c7"
                strokeOpacity="0.35"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="4.5"
                fill="#0284c7"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </>
          )}
        </svg>
      </div>

      {/* Min / Max Summary */}
      <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
        <div className="px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Mínima</span>
          <span className="font-mono-tabular font-semibold text-slate-900 dark:text-slate-100">
            {formatUnitRate(stats.min)}
          </span>
        </div>
        <div className="px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Máxima</span>
          <span className="font-mono-tabular font-semibold text-slate-900 dark:text-slate-100">
            {formatUnitRate(stats.max)}
          </span>
        </div>
      </div>
    </div>
  );
};

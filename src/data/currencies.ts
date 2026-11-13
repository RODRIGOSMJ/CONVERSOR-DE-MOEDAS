export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  country?: string;
  crypto?: 'btc' | 'eth' | 'sol' | 'pol' | 'trx' | 'bnb';
  coingeckoId?: string;
  decimals: number;
}

export const ALL_CURRENCIES: CurrencyInfo[] = [
  { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$', country: 'br', decimals: 2 },
  { code: 'USD', name: 'Dólar Americano', symbol: '$', country: 'us', decimals: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', country: 'eu', decimals: 2 },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£', country: 'gb', decimals: 2 },
  { code: 'CAD', name: 'Dólar Canadense', symbol: 'C$', country: 'ca', decimals: 2 },
  { code: 'AUD', name: 'Dólar Australiano', symbol: 'A$', country: 'au', decimals: 2 },
  { code: 'JPY', name: 'Iene Japonês', symbol: '¥', country: 'jp', decimals: 0 },
  { code: 'CHF', name: 'Franco Suíço', symbol: 'Fr', country: 'ch', decimals: 2 },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$', country: 'ar', decimals: 2 },
  { code: 'PYG', name: 'Guarani Paraguaio', symbol: '₲', country: 'py', decimals: 0 },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$', country: 'cl', decimals: 0 },
  { code: 'UYU', name: 'Peso Uruguaio', symbol: '$U', country: 'uy', decimals: 2 },
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$', country: 'mx', decimals: 2 },
  { code: 'CNY', name: 'Yuan Chinês', symbol: '¥', country: 'cn', decimals: 2 },
  { code: 'BTC', name: 'Bitcoin', symbol: '₿', crypto: 'btc', coingeckoId: 'bitcoin', decimals: 6 },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', crypto: 'eth', coingeckoId: 'ethereum', decimals: 5 },
  { code: 'SOL', name: 'Solana', symbol: '◎', crypto: 'sol', coingeckoId: 'solana', decimals: 4 },
  { code: 'POL', name: 'Polygon', symbol: '⬡', crypto: 'pol', coingeckoId: 'polygon-ecosystem-token', decimals: 3 },
  { code: 'TRX', name: 'TRON', symbol: '◈', crypto: 'trx', coingeckoId: 'tron', decimals: 3 },
  { code: 'BNB', name: 'BNB Chain', symbol: '❖', crypto: 'bnb', coingeckoId: 'binancecoin', decimals: 4 },
];

export const CURRENCY_MAP: Record<string, CurrencyInfo> = Object.fromEntries(
  ALL_CURRENCIES.map((c) => [c.code, c])
);

export const DEFAULT_SELECTED_CODES = ['BRL', 'USD', 'EUR', 'BTC', 'ETH', 'SOL', 'POL', 'TRX', 'BNB'];

export const DEFAULT_RATES_USD: Record<string, number> = {
  USD: 1,
  BRL: 5.64,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.39,
  AUD: 1.53,
  JPY: 153.5,
  CHF: 0.88,
  ARS: 1015.0,
  PYG: 7850.0,
  CLP: 965.0,
  UYU: 42.3,
  MXN: 20.15,
  CNY: 7.22,
  BTC: 1 / 89500,
  ETH: 1 / 3150,
  SOL: 1 / 215,
  POL: 1 / 0.55,
  TRX: 1 / 0.24,
  BNB: 1 / 620,
};

export function formatNumberToInput(num: number): string {
  if (!Number.isFinite(num)) return '0';
  const rounded = Math.round(num * 1_000_000) / 1_000_000;
  return rounded.toString().replace('.', ',');
}

export function formatRawInputString(raw: string): string {
  const parts = raw.split(',');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return parts.length > 1 ? `${intPart},${parts[1]}` : intPart;
}

export function formatDisplayNumber(num: number, maxDecimals = 2): string {
  if (!Number.isFinite(num) || num === 0) {
    return maxDecimals === 0 ? '0' : '0,00';
  }
  const decimals = Math.abs(num) < 0.01 ? Math.max(maxDecimals, 6) : maxDecimals;
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: Math.min(2, decimals),
    maximumFractionDigits: decimals,
  });
}

export function formatUnitRate(rate: number): string {
  if (!Number.isFinite(rate) || rate <= 0) return '0,00';
  if (rate < 0.01) {
    return rate.toFixed(6).replace('.', ',');
  }
  return rate.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

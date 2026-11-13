import React from 'react';
import { ArrowUpDown, Delete } from 'lucide-react';

export type CalcOperator = '+' | '-' | '*' | '/';

interface KeypadProps {
  onDigit: (digit: string) => void;
  onDecimal: () => void;
  onBackspace: () => void;
  onClear: () => void;
  onOperator: (op: CalcOperator) => void;
  onEquals: () => void;
  onSwapTopTwo: () => void;
  activeOperator: CalcOperator | null;
}

export const Keypad: React.FC<KeypadProps> = ({
  onDigit,
  onDecimal,
  onBackspace,
  onClear,
  onOperator,
  onEquals,
  onSwapTopTwo,
  activeOperator,
}) => {
  const opBtnClass = (op: CalcOperator) =>
    `h-12 rounded-xl font-bold text-xl shadow-xs border transition-transform duration-100 active:scale-95 select-none flex items-center justify-center cursor-pointer ${
      activeOperator === op
        ? 'bg-sky-600 text-white border-sky-500'
        : 'bg-[#dce4ec] dark:bg-slate-800/95 hover:bg-slate-300 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-400 border-slate-300/70 dark:border-slate-700/70'
    }`;

  const digitBtnClass =
    'h-12 rounded-xl bg-white dark:bg-[#1f2636] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-semibold text-xl shadow-xs border border-slate-200/90 dark:border-slate-800 transition-transform duration-100 active:scale-95 select-none cursor-pointer';

  return (
    <div className="p-2.5 grid grid-cols-4 gap-1.5 font-mono-tabular bg-[#e8edf2] dark:bg-[#161b26]">
      <button
        type="button"
        onClick={onClear}
        aria-label="Limpar valor"
        className="h-12 rounded-xl bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 font-sans font-extrabold text-lg shadow-xs border border-slate-200/90 dark:border-slate-700/70 transition-transform duration-100 active:scale-95 select-none cursor-pointer"
      >
        C
      </button>
      <button
        type="button"
        onClick={() => onOperator('/')}
        aria-label="Dividir"
        className={opBtnClass('/')}
      >
        ÷
      </button>
      <button
        type="button"
        onClick={() => onOperator('*')}
        aria-label="Multiplicar"
        className={opBtnClass('*')}
      >
        ×
      </button>
      <button
        type="button"
        onClick={onBackspace}
        aria-label="Apagar último dígito"
        className="h-12 rounded-xl bg-[#dce4ec] dark:bg-slate-800/95 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-lg shadow-xs border border-slate-300/70 dark:border-slate-700/70 flex items-center justify-center transition-transform duration-100 active:scale-95 select-none cursor-pointer"
      >
        <Delete className="w-5 h-5" />
      </button>

      {(['7', '8', '9'] as const).map((d) => (
        <button key={d} type="button" onClick={() => onDigit(d)} className={digitBtnClass}>
          {d}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onOperator('-')}
        aria-label="Subtrair"
        className={opBtnClass('-')}
      >
        −
      </button>

      {(['4', '5', '6'] as const).map((d) => (
        <button key={d} type="button" onClick={() => onDigit(d)} className={digitBtnClass}>
          {d}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onOperator('+')}
        aria-label="Somar"
        className={opBtnClass('+')}
      >
        +
      </button>

      {(['1', '2', '3'] as const).map((d) => (
        <button key={d} type="button" onClick={() => onDigit(d)} className={digitBtnClass}>
          {d}
        </button>
      ))}
      <button
        type="button"
        onClick={onEquals}
        aria-label="Calcular resultado"
        className="row-span-2 rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold text-2xl shadow-md shadow-orange-500/20 flex items-center justify-center transition-transform duration-100 active:scale-95 select-none cursor-pointer"
      >
        =
      </button>

      <button
        type="button"
        onClick={onSwapTopTwo}
        title="Inverter as duas primeiras moedas"
        aria-label="Inverter as duas primeiras moedas"
        className="h-12 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 font-bold text-lg shadow-xs border border-slate-200/90 dark:border-slate-700/70 flex items-center justify-center transition-transform duration-100 active:scale-95 select-none cursor-pointer"
      >
        <ArrowUpDown className="w-5 h-5" />
      </button>
      <button type="button" onClick={() => onDigit('0')} className={digitBtnClass}>
        0
      </button>
      <button
        type="button"
        onClick={onDecimal}
        aria-label="Vírgula decimal"
        className={digitBtnClass}
      >
        ,
      </button>
    </div>
  );
};

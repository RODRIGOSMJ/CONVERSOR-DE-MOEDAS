import React from 'react';
import { Delete, RefreshCw } from 'lucide-react';

export type CalcOperator = '+' | '-' | '*' | '/';

interface KeypadProps {
  onDigit: (digit: string) => void;
  onDecimal: () => void;
  onBackspace: () => void;
  onClear: () => void;
  onOperator: (op: CalcOperator) => void;
  onSwapTopTwo: () => void;
  onToggleCollapse?: () => void;
  activeOperator: CalcOperator | null;
}

export const Keypad: React.FC<KeypadProps> = ({
  onDigit,
  onDecimal,
  onBackspace,
  onClear,
  onOperator,
  onSwapTopTwo,
  onToggleCollapse,
  activeOperator,
}) => {
  const digitBtnClass =
    'h-[52px] rounded-xl bg-white dark:bg-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#333333] text-slate-900 dark:text-[#f2f2f2] font-normal text-2xl shadow-xs transition-transform duration-100 active:scale-95 select-none cursor-pointer flex items-center justify-center';

  const opBtnClass = (op: CalcOperator) =>
    `rounded-lg font-bold text-xl flex items-center justify-center transition-transform duration-100 active:scale-95 select-none cursor-pointer ${
      activeOperator === op
        ? 'bg-[#e09f5a] text-[#141414]'
        : 'hover:bg-slate-100 dark:hover:bg-[#383838] text-[#e09f5a]'
    }`;

  return (
    <div className="bg-slate-100 dark:bg-[#1d1d1d] rounded-t-2xl lg:rounded-none border-t border-slate-200 dark:border-[#2a2a2a] lg:border-t-0">
      {/* Drawer Handle (mobile) */}
      {onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Recolher ou expandir teclado"
          className="lg:hidden w-full py-2 flex justify-center cursor-pointer"
        >
          <span className="w-8 h-1 rounded-full bg-slate-300 dark:bg-[#4a4a4a]" />
        </button>
      )}

      <div className="px-2.5 pb-2.5 pt-2.5 lg:pt-2.5 grid grid-cols-4 gap-2 font-mono-tabular">
        {/* Linha 1: C, 7, 8, 9 */}
        <button
          type="button"
          onClick={onClear}
          aria-label="Limpar valor"
          className="h-[52px] rounded-xl bg-white dark:bg-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#333333] text-[#d9534f] font-medium text-2xl shadow-xs transition-transform duration-100 active:scale-95 select-none cursor-pointer flex items-center justify-center"
        >
          C
        </button>
        {(['7', '8', '9'] as const).map((d) => (
          <button key={d} type="button" onClick={() => onDigit(d)} className={digitBtnClass}>
            {d}
          </button>
        ))}

        {/* Linha 2: Inverter, 4, 5, 6 */}
        <button
          type="button"
          onClick={onSwapTopTwo}
          title="Inverter moedas principais"
          aria-label="Inverter moedas principais"
          className="h-[52px] rounded-xl bg-white dark:bg-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#333333] text-[#4f86c6] font-bold text-xl shadow-xs flex items-center justify-center transition-transform duration-100 active:scale-95 select-none cursor-pointer"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
        {(['4', '5', '6'] as const).map((d) => (
          <button key={d} type="button" onClick={() => onDigit(d)} className={digitBtnClass}>
            {d}
          </button>
        ))}

        {/* Linha 3 & 4 Esquerda: Bloco 2x2 de Operações (+ − × ÷) */}
        <div className="row-span-2 grid grid-cols-2 gap-1 rounded-xl bg-white dark:bg-[#2a2a2a] p-1.5 shadow-xs">
          <button
            type="button"
            onClick={() => onOperator('+')}
            aria-label="Somar"
            className={opBtnClass('+')}
          >
            +
          </button>
          <button
            type="button"
            onClick={() => onOperator('-')}
            aria-label="Subtrair"
            className={opBtnClass('-')}
          >
            −
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
            onClick={() => onOperator('/')}
            aria-label="Dividir"
            className={opBtnClass('/')}
          >
            ÷
          </button>
        </div>

        {/* Linha 3 Direita: 1, 2, 3 */}
        {(['1', '2', '3'] as const).map((d) => (
          <button key={d} type="button" onClick={() => onDigit(d)} className={digitBtnClass}>
            {d}
          </button>
        ))}

        {/* Linha 4 Direita: 0, Vírgula, Apagar */}
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
        <button
          type="button"
          onClick={onBackspace}
          aria-label="Apagar último dígito"
          className="h-[52px] rounded-xl bg-white dark:bg-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#333333] text-slate-800 dark:text-[#f2f2f2] font-bold text-xl shadow-xs flex items-center justify-center transition-transform duration-100 active:scale-95 select-none cursor-pointer"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

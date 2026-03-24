'use client';

import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={cn(
        'w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all touch-manipulation',
        checked
          ? 'bg-sage-500 border-sage-500 text-white'
          : 'bg-white border-parchment-400 hover:border-sage-400',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {checked && (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      <span className="sr-only">{label}</span>
    </button>
  );
}

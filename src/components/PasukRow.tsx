'use client';

import { useTransition } from 'react';
import { Toggle } from './Toggle';
import { updatePasukProgress } from '@/app/actions';
import { useLanguage, toHebrewNumeral } from '@/lib/language';

interface PasukRowProps {
  pasuk: {
    id: string;
    perek: number;
    pasuk: number;
    done: boolean;
    mikra1: boolean;
    mikra2: boolean;
    targum: boolean;
  };
  hebrewYear: number;
}

export function PasukRow({ pasuk, hebrewYear }: PasukRowProps) {
  const [isPending, startTransition] = useTransition();
  const { lang } = useLanguage();
  const isHe = lang === 'he';

  const handleToggle = (field: 'done' | 'mikra1' | 'mikra2' | 'targum', value: boolean) => {
    startTransition(async () => {
      await updatePasukProgress(pasuk.id, field, value, hebrewYear);
    });
  };

  const fields = [
    { field: 'done'   as const, label: isHe ? 'הושלם' : 'Done',    checked: pasuk.done   },
    { field: 'mikra1' as const, label: isHe ? 'מקרא א' : 'Mikra 1', checked: pasuk.mikra1 },
    { field: 'mikra2' as const, label: isHe ? 'מקרא ב' : 'Mikra 2', checked: pasuk.mikra2 },
    { field: 'targum' as const, label: isHe ? 'תרגום' : 'Targum',   checked: pasuk.targum },
  ];

  return (
    <div className="flex items-center gap-4 py-3 px-4 hover:bg-parchment-50 transition-colors">
      <span className="text-sm font-medium text-ink-700 font-hebrew flex-shrink-0">
        <span className="text-xs text-ink-400 me-1">{isHe ? 'פסוק' : 'Pasuk'}</span>
        {isHe ? toHebrewNumeral(pasuk.pasuk) : pasuk.pasuk}
      </span>

      <div className="flex gap-4 flex-wrap">
        {fields.map(({ field, label, checked }) => (
          <div key={field} className="flex items-center gap-1.5">
            <Toggle
              checked={checked}
              onChange={(value) => handleToggle(field, value)}
              label={label}
              disabled={isPending}
            />
            <span className="text-xs text-ink-600 font-hebrew">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

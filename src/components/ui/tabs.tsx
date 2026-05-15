'use client';
import { ReactNode } from 'react';
import clsx from 'clsx';

interface Tab { id: string; label: string; icon?: ReactNode; }

export function Tabs({ tabs, active, onChange }: { tabs: Tab[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 border-b pb-1 overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition whitespace-nowrap',
            active === t.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}

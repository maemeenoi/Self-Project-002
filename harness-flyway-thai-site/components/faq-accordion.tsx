'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FAQAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y rounded-md border">
      {items.map((it, idx) => (
        <button
          key={idx}
          className="w-full text-left p-4 focus:outline-none"
          aria-expanded={open === idx}
          onClick={() => setOpen(open === idx ? null : idx)}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{it.q}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${open === idx ? 'rotate-180' : ''}`} />
          </div>
          {open === idx && <p className="mt-2 text-sm text-gray-700">{it.a}</p>}
        </button>
      ))}
    </div>
  );
}

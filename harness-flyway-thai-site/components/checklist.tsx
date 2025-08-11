'use client';
import { useState } from 'react';

export type StepItem = { title: string; items: string[] };

export function Checklist({ steps }: { steps: StepItem[] }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  return (
    <div className="space-y-6">
      {steps.map((s) => (
        <section key={s.title} className="rounded-xl border p-4">
          <h2 className="font-semibold mb-2">{s.title}</h2>
          <ul className="space-y-2">
            {s.items.map((it) => (
              <li key={it} className="flex items-center gap-2">
                <input
                  aria-label={it}
                  type="checkbox"
                  checked={!!done[it]}
                  onChange={(e) => setDone((d) => ({ ...d, [it]: e.target.checked }))}
                  className="h-4 w-4"
                />
                <span className={done[it] ? 'line-through text-gray-500' : ''}>{it}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

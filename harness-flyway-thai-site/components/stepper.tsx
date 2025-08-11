const steps = [
  'Discovery & Planning',
  'Environment Setup',
  'Native Harness Assessment',
  'Flyway Integration',
  'Testing & Report'
];

export function Stepper() {
  return (
    <ol className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {steps.map((s, i) => (
        <li key={s} className="rounded-xl border p-4">
          <div className="text-xs text-gray-500">ขั้นตอน {i + 1}</div>
          <div className="font-medium">{s}</div>
        </li>
      ))}
    </ol>
  );
}

export type TimelineItem = {
  task: string; owner: string; status: 'Not started'|'In progress'|'Blocked'|'Done'; due?: string
};

const statusColor: Record<TimelineItem['status'], string> = {
  'Not started': 'bg-gray-200 text-gray-800',
  'In progress': 'bg-blue-100 text-blue-800',
  'Blocked': 'bg-red-100 text-red-800',
  'Done': 'bg-green-100 text-green-800'
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">{it.task}</div>
            <span className={`px-2 py-1 rounded ${statusColor[it.status]}`}>{it.status}</span>
          </div>
          <div className="text-sm text-gray-600">เจ้าของงาน: {it.owner}{it.due ? ` · กำหนดส่ง: ${it.due}` : ''}</div>
        </div>
      ))}
    </div>
  );
}

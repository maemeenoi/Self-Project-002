import StatusChip from './StatusChip'
type Row = {
  id: string; key?: string; title: string; status: string; type: string;
  priority?: string; project?: string; reporter?: string; assignee?: string; url?: string
}
export default function JiraTasksTable({ rows }: { rows: Row[] }) {
  return (
    <div className="p-4 border rounded-2xl shadow-sm">
      <h3 className="text-lg font-semibold mb-2">My Tasks</h3>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-600">
            <tr>
              <th className="py-2 pr-2">Title</th>
              <th className="py-2 pr-2">Priority</th>
              <th className="py-2 pr-2">Status</th>
              <th className="py-2 pr-2">Type</th>
              <th className="py-2 pr-2">Project</th>
              <th className="py-2 pr-2">Reporter</th>
              <th className="py-2 pr-2">Assignee</th>
              <th className="py-2 pr-2">Link</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t">
                <td className="py-2 pr-2">{r.title}</td>
                <td className="py-2 pr-2">{r.priority ?? '-'}</td>
                <td className="py-2 pr-2"><StatusChip label={r.status} /></td>
                <td className="py-2 pr-2">{r.type}</td>
                <td className="py-2 pr-2">{r.project ?? '-'}</td>
                <td className="py-2 pr-2">{r.reporter ?? '-'}</td>
                <td className="py-2 pr-2">{r.assignee ?? '-'}</td>
                <td className="py-2 pr-2">{r.url ? <a className="underline" target="_blank" href={r.url}>open</a> : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

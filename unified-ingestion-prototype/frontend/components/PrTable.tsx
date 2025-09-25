import StatusChip from './StatusChip'

type Row = {
  id: string; title: string; status: string; author: string;
  reviewers: string; assignees: string; changedFiles: number; url: string // reviewers/assignees are JSON strings
}
export default function PrTable({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div className="p-4 border rounded-2xl shadow-sm">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-600">
            <tr>
              <th className="py-2 pr-2">Title</th>
              <th className="py-2 pr-2">Status</th>
              <th className="py-2 pr-2">Author</th>
              <th className="py-2 pr-2">Reviewers</th>
              <th className="py-2 pr-2">Assignees</th>
              <th className="py-2 pr-2">Changed Files</th>
              <th className="py-2 pr-2">Link</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t">
                <td className="py-2 pr-2">{r.title}</td>
                <td className="py-2 pr-2"><StatusChip label={r.status} /></td>
                <td className="py-2 pr-2">{r.author}</td>
                <td className="py-2 pr-2">{JSON.parse(r.reviewers || '[]').join(', ')}</td>
                <td className="py-2 pr-2">{JSON.parse(r.assignees || '[]').join(', ')}</td>
                <td className="py-2 pr-2">{r.changedFiles}</td>
                <td className="py-2 pr-2"><a href={r.url} target="_blank" className="underline">open</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

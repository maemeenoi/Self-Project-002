import StatusChip from './StatusChip'

type GitHubAction = {
  id: string
  name: string
  status: string
  conclusion: string | null
  repo: string
  branch: string
  actor: string
  event: string
  createdAt: string
  runNumber: number
  url: string
}

export default function GitHubActionsTable({ title, rows }: { title: string; rows: GitHubAction[] }) {
  return (
    <div className="p-4 border rounded-2xl shadow-sm">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-600">
            <tr>
              <th className="py-2 pr-2">Workflow</th>
              <th className="py-2 pr-2">Status</th>
              <th className="py-2 pr-2">Conclusion</th>
              <th className="py-2 pr-2">Branch</th>
              <th className="py-2 pr-2">Actor</th>
              <th className="py-2 pr-2">Run #</th>
              <th className="py-2 pr-2">Created</th>
              <th className="py-2 pr-2">Link</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t">
                <td className="py-2 pr-2">{r.name}</td>
                <td className="py-2 pr-2"><StatusChip label={r.status} /></td>
                <td className="py-2 pr-2">
                  {r.conclusion ? (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.conclusion === 'success' ? 'bg-green-100 text-green-800' : 
                      r.conclusion === 'failure' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {r.conclusion}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="py-2 pr-2">{r.branch}</td>
                <td className="py-2 pr-2">{r.actor}</td>
                <td className="py-2 pr-2">#{r.runNumber}</td>
                <td className="py-2 pr-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="py-2 pr-2">
                  <a href={r.url} target="_blank" className="underline text-blue-600">
                    view
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No workflow runs found
          </div>
        )}
      </div>
    </div>
  )
}

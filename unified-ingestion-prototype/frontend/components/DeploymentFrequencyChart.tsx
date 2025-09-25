'use client'
import { LineChart, Line, Tooltip, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts'
export default function DeploymentFrequencyChart({ data }: { data: { weekStart: string; count: number }[] }) {
  return (
    <div className="p-4 border rounded-2xl shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Deployment Frequency over time</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="weekStart" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

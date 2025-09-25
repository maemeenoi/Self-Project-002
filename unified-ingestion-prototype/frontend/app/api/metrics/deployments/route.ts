import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function startOfWeek(d: Date) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const day = date.getUTCDay() // 0 Sun
  const diff = (day + 6) % 7 // make Monday start
  date.setUTCDate(date.getUTCDate() - diff)
  date.setUTCHours(0,0,0,0)
  return date
}

export async function GET() {
  // derive from merged PRs
  const prs = await prisma.pullRequest.findMany({ where: { mergedAt: { not: null } } })
  const counts: Record<string, number> = {}
  for (const pr of prs) {
    const ws = startOfWeek(pr.mergedAt || new Date())
    const key = ws.toISOString().slice(0,10)
    counts[key] = (counts[key] ?? 0) + 1
  }
  // produce 12 weeks window if empty (demo series)
  if (Object.keys(counts).length === 0) {
    const now = new Date()
    for (let i=11;i>=0;i--) {
      const d = new Date(now); d.setDate(d.getDate() - i*7)
      const key = startOfWeek(d).toISOString().slice(0,10)
      counts[key] = Math.floor(8 + Math.sin(i/2)*5) // demo wiggle
    }
  }
  const data = Object.entries(counts).sort().map(([weekStart, count]) => ({ weekStart, count }))
  return NextResponse.json(data)
}

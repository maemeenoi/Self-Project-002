import { NextRequest, NextResponse } from 'next/server'
import { JiraApiAdapter } from '@/ingestion/jira/JiraApiAdapter'
import { writeIssues } from '@/ingestion/pipeline/IngestionCoordinator'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=>({}))
  const adapter = new JiraApiAdapter()
  const { records, meta } = await adapter.pull({ jql: body.jql, projects: body.projects, demo: !!body.demo } as any)
  if (!body.demo) await writeIssues(records)
  return NextResponse.json({ data: records, meta })
}

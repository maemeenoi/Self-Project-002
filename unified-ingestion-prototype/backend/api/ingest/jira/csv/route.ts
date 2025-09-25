import { NextRequest, NextResponse } from 'next/server'
import { JiraCsvAdapter } from '@/ingestion/jira/JiraCsvAdapter'
import { writeIssues } from '@/ingestion/pipeline/IngestionCoordinator'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 })
  const buf = Buffer.from(await file.arrayBuffer())
  const adapter = new JiraCsvAdapter()
  const { records, meta } = await adapter.pull({ csvBuffer: buf, projectKey: form.get('projectKey') as string | undefined } as any)
  await writeIssues(records)
  return NextResponse.json({ data: records, meta })
}

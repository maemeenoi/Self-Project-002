'use client'
import { useEffect, useState } from 'react'
import PrTable from '../../components/PrTable'
import JiraTasksTable from '../../components/JiraTasksTable'
import DeploymentFrequencyChart from '../../components/DeploymentFrequencyChart'
import GitHubActionsTable from '../../components/GitHubActionsTable'

export default function DashboardPage() {
  const [openPrs, setOpenPrs] = useState<any[]>([])
  const [waitingPrs, setWaitingPrs] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [actions, setActions] = useState<any[]>([])
  const [freq, setFreq] = useState<any[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        // Load ingested GitHub PR data from database
        const ingestedPrs = await fetch('/api/data/github').then(r=>r.json())
        if (ingestedPrs.success && ingestedPrs.data.length > 0) {
          setOpenPrs(ingestedPrs.data.filter((p:any)=>p.state==='open'))
          setWaitingPrs(ingestedPrs.data.filter((p:any)=>p.state==='open'))
        } else {
          // Fallback to API ingestion if no data in database
          const prs = await fetch('/api/ingest/github/prs', { 
            method: 'POST', 
            body: JSON.stringify({ demo: false }), 
            headers: { 'content-type': 'application/json' } 
          }).then(r=>r.json())
          setOpenPrs(prs.data.filter((p:any)=>p.status==='open'))
          setWaitingPrs(prs.data.filter((p:any)=>p.status==='open'))
        }
        
        // Load ingested Jira data from database
        const ingestedJira = await fetch('/api/data/jira').then(r=>r.json())
        if (ingestedJira.success && ingestedJira.data.length > 0) {
          setTasks(ingestedJira.data)
        } else {
          // Fallback to CSV ingestion if no data in database
          const issues = await fetch('/api/ingest/jira/csv-file', { 
            method: 'POST', 
            body: JSON.stringify({ filename: 'Jira (2).csv', demo: false }), 
            headers: { 'content-type':'application/json' } 
          }).then(r=>r.json())
          setTasks(issues.data)
        }
        
        // Load GitHub Actions data (keep existing logic)
        const actionsData = await fetch('/api/ingest/github/actions', { 
          method: 'POST', 
          body: JSON.stringify({ demo: false }), 
          headers: { 'content-type':'application/json' } 
        }).then(r=>r.json())
        setActions(actionsData.data || [])
        
        const df = await fetch('/api/metrics/deployments').then(r=>r.json())
        setFreq(df)
      } catch (e) { 
        console.error('Error loading dashboard data:', e) 
        // Fallback to demo data on error
        const prs = await fetch('/api/ingest/github/prs', { method: 'POST', body: JSON.stringify({ demo: true }), headers: { 'content-type': 'application/json' } }).then(r=>r.json())
        setOpenPrs(prs.data.filter((p:any)=>p.status==='open'))
        setWaitingPrs(prs.data.filter((p:any)=>p.status==='open'))
        const issues = await fetch('/api/ingest/jira/api', { method: 'POST', body: JSON.stringify({ demo: true }), headers: { 'content-type':'application/json' } }).then(r=>r.json())
        setTasks(issues.data)
        const actionsData = await fetch('/api/ingest/github/actions', { method: 'POST', body: JSON.stringify({ demo: true }), headers: { 'content-type':'application/json' } }).then(r=>r.json())
        setActions(actionsData.data || [])
      }
    })()
  }, [])

  return (
    <main className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PrTable title="My Open PRs" rows={openPrs} />
        <PrTable title="PRs waiting for me" rows={waitingPrs} />
      </div>
      <JiraTasksTable rows={tasks} />
      <GitHubActionsTable title="Recent GitHub Actions" rows={actions} />
      <DeploymentFrequencyChart data={freq} />
    </main>
  )
}

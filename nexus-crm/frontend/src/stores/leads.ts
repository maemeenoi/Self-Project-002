import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'

export interface Lead {
  id: number
  company_name: string
  status: string
  source: string
  created_at: string
}

export interface LeadCreate {
  company_name: string
  status: string
  source: string
}

export interface DashboardStats {
  total_leads: number
  new_this_week: number
  active_deals: number
  win_rate: number
}

export const useLeadsStore = defineStore('leads', () => {
  const leads = ref<Lead[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const stats = ref<DashboardStats | null>(null)

  async function fetchLeads() {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get<Lead[]>('/leads')
      leads.value = data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch leads'
    } finally {
      loading.value = false
    }
  }

  async function fetchLead(id: number): Promise<Lead | null> {
    try {
      const { data } = await api.get<Lead>(`/leads/${id}`)
      return data
    } catch {
      return null
    }
  }

  async function createLead(payload: LeadCreate): Promise<Lead> {
    const { data } = await api.post<Lead>('/leads', payload)
    leads.value.unshift(data)
    return data
  }

  async function updateLead(id: number, payload: Partial<LeadCreate>): Promise<Lead> {
    const { data } = await api.put<Lead>(`/leads/${id}`, payload)
    const idx = leads.value.findIndex((l) => l.id === id)
    if (idx !== -1) leads.value[idx] = data
    return data
  }

  async function deleteLead(id: number): Promise<void> {
    await api.delete(`/leads/${id}`)
    leads.value = leads.value.filter((l) => l.id !== id)
  }

  async function fetchStats() {
    try {
      const { data } = await api.get<DashboardStats>('/dashboard/stats')
      stats.value = data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch stats'
    }
  }

  return { leads, loading, error, stats, fetchLeads, fetchLead, createLead, updateLead, deleteLead, fetchStats }
})

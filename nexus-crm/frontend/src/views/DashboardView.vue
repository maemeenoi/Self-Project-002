<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLeadsStore } from '@/stores/leads'
import KpiCard from '@/components/KpiCard.vue'
import LeadsTable from '@/components/LeadsTable.vue'
import type { Lead } from '@/stores/leads'

const store = useLeadsStore()
const router = useRouter()

onMounted(async () => {
  await Promise.all([store.fetchLeads(), store.fetchStats()])
})

const recentLeads = computed(() => store.leads.slice(0, 5))

function onSelectLead(lead: Lead) {
  router.push(`/leads/${lead.id}`)
}
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

    <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Total Leads"
        :value="store.stats?.total_leads ?? '—'"
        subtitle="All time"
      />
      <KpiCard
        title="New This Week"
        :value="store.stats?.new_this_week ?? '—'"
        subtitle="Last 7 days"
      />
      <KpiCard
        title="Active Deals"
        :value="store.stats?.active_deals ?? '—'"
        subtitle="In pipeline"
      />
      <KpiCard
        title="Win Rate"
        :value="store.stats ? `${store.stats.win_rate}%` : '—'"
        subtitle="Closed-won vs total closed"
      />
    </div>

    <div>
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-base font-semibold text-gray-700">Recent Leads</h2>
        <RouterLink to="/leads" class="text-sm text-indigo-600 hover:underline">View all</RouterLink>
      </div>
      <div v-if="store.loading" class="py-10 text-center text-sm text-gray-400">Loading…</div>
      <LeadsTable v-else :leads="recentLeads" @select="onSelectLead" />
    </div>
  </div>
</template>

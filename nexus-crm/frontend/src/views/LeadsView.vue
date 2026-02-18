<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLeadsStore } from '@/stores/leads'
import LeadsTable from '@/components/LeadsTable.vue'
import type { Lead } from '@/stores/leads'

const store = useLeadsStore()
const router = useRouter()
const search = ref('')

onMounted(() => store.fetchLeads())

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return store.leads
  return store.leads.filter((l) => l.company_name.toLowerCase().includes(q))
})

function onSelectLead(lead: Lead) {
  router.push(`/leads/${lead.id}`)
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Leads</h1>
      <RouterLink
        to="/leads/new"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
      >
        + Add Lead
      </RouterLink>
    </div>

    <div class="mb-4">
      <input
        v-model="search"
        type="text"
        placeholder="Search by company name…"
        class="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />
    </div>

    <div v-if="store.loading" class="py-10 text-center text-sm text-gray-400">Loading…</div>
    <LeadsTable v-else :leads="filtered" @select="onSelectLead" />
  </div>
</template>

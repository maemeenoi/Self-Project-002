<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLeadsStore } from '@/stores/leads'
import type { Lead } from '@/stores/leads'

const route = useRoute()
const router = useRouter()
const store = useLeadsStore()

const lead = ref<Lead | null>(null)
const loading = ref(true)
const deleting = ref(false)

onMounted(async () => {
  lead.value = await store.fetchLead(Number(route.params.id))
  loading.value = false
})

async function handleDelete() {
  if (!lead.value) return
  if (!confirm(`Delete "${lead.value.company_name}"?`)) return
  deleting.value = true
  await store.deleteLead(lead.value.id)
  router.push('/leads')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NZ', { day: '2-digit', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center gap-4">
      <button
        class="text-sm text-gray-500 hover:text-gray-700"
        @click="router.push('/leads')"
      >
        &larr; Back to Leads
      </button>
    </div>

    <div v-if="loading" class="py-10 text-center text-sm text-gray-400">Loading…</div>

    <div v-else-if="!lead" class="py-10 text-center text-sm text-gray-400">Lead not found.</div>

    <div v-else class="max-w-xl rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 class="mb-6 text-2xl font-bold text-gray-900">{{ lead.company_name }}</h1>

      <dl class="space-y-4">
        <div class="flex gap-4">
          <dt class="w-32 shrink-0 text-sm font-medium text-gray-500">Status</dt>
          <dd class="text-sm text-gray-900 capitalize">{{ lead.status }}</dd>
        </div>
        <div class="flex gap-4">
          <dt class="w-32 shrink-0 text-sm font-medium text-gray-500">Source</dt>
          <dd class="text-sm text-gray-900 capitalize">{{ lead.source }}</dd>
        </div>
        <div class="flex gap-4">
          <dt class="w-32 shrink-0 text-sm font-medium text-gray-500">Created</dt>
          <dd class="text-sm text-gray-900">{{ formatDate(lead.created_at) }}</dd>
        </div>
      </dl>

      <div class="mt-8 flex gap-3">
        <RouterLink
          :to="`/leads/${lead.id}/edit`"
          class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Edit
        </RouterLink>
        <button
          class="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          :disabled="deleting"
          @click="handleDelete"
        >
          {{ deleting ? 'Deleting…' : 'Delete' }}
        </button>
      </div>
    </div>
  </div>
</template>

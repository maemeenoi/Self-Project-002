<script setup lang="ts">
import type { Lead } from '@/stores/leads'

defineProps<{ leads: Lead[] }>()
const emit = defineEmits<{ select: [lead: Lead] }>()

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric' })
}

const statusClasses: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-purple-100 text-purple-700',
  proposal: 'bg-orange-100 text-orange-700',
  'closed-won': 'bg-green-100 text-green-700',
  'closed-lost': 'bg-red-100 text-red-700',
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Company</th>
          <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
          <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Source</th>
          <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 bg-white">
        <tr
          v-for="lead in leads"
          :key="lead.id"
          class="cursor-pointer transition-colors hover:bg-gray-50"
          @click="emit('select', lead)"
        >
          <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ lead.company_name }}</td>
          <td class="px-6 py-4">
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
              :class="statusClasses[lead.status] ?? 'bg-gray-100 text-gray-600'"
            >
              {{ lead.status }}
            </span>
          </td>
          <td class="px-6 py-4 text-sm capitalize text-gray-500">{{ lead.source }}</td>
          <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(lead.created_at) }}</td>
        </tr>
        <tr v-if="leads.length === 0">
          <td colspan="4" class="px-6 py-10 text-center text-sm text-gray-400">No leads found.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

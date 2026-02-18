<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLeadsStore } from '@/stores/leads'

const route = useRoute()
const router = useRouter()
const store = useLeadsStore()

const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const error = ref<string | null>(null)

const form = ref({
  company_name: '',
  status: 'new',
  source: 'other',
})

onMounted(async () => {
  if (isEdit.value) {
    const lead = await store.fetchLead(Number(route.params.id))
    if (lead) {
      form.value.company_name = lead.company_name
      form.value.status = lead.status
      form.value.source = lead.source
    }
  }
})

async function handleSubmit() {
  if (!form.value.company_name.trim()) {
    error.value = 'Company name is required.'
    return
  }
  saving.value = true
  error.value = null
  try {
    if (isEdit.value) {
      await store.updateLead(Number(route.params.id), form.value)
      router.push(`/leads/${route.params.id}`)
    } else {
      const lead = await store.createLead(form.value)
      router.push(`/leads/${lead.id}`)
    }
  } catch {
    error.value = 'Failed to save. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <button class="text-sm text-gray-500 hover:text-gray-700" @click="router.back()">
        &larr; Back
      </button>
    </div>

    <div class="max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 class="mb-6 text-xl font-bold text-gray-900">
        {{ isEdit ? 'Edit Lead' : 'New Lead' }}
      </h1>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700" for="company_name">
            Company Name <span class="text-red-500">*</span>
          </label>
          <input
            id="company_name"
            v-model="form.company_name"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            placeholder="Acme Corp"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700" for="status">Status</label>
          <select
            id="status"
            v-model="form.status"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="closed-won">Closed Won</option>
            <option value="closed-lost">Closed Lost</option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700" for="source">Source</label>
          <select
            id="source"
            v-model="form.source"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="cold-outreach">Cold Outreach</option>
            <option value="social">Social</option>
            <option value="event">Event</option>
            <option value="other">Other</option>
          </select>
        </div>

        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

        <div class="flex gap-3 pt-2">
          <button
            type="submit"
            class="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            :disabled="saving"
          >
            {{ saving ? 'Saving…' : isEdit ? 'Update Lead' : 'Create Lead' }}
          </button>
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            @click="router.back()"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

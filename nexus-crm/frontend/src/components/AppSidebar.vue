<script setup lang="ts">
import { LayoutDashboard, Users } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
</script>

<template>
  <aside class="flex h-full w-60 flex-col border-r border-gray-200 bg-white">
    <div class="flex h-16 items-center border-b border-gray-200 px-6">
      <span class="text-lg font-bold text-indigo-600">NexusCRM</span>
    </div>
    <nav class="flex-1 space-y-1 px-3 py-4">
      <RouterLink
        to="/"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
        active-class="bg-indigo-50 text-indigo-600"
      >
        <LayoutDashboard class="h-4 w-4 shrink-0" />
        Dashboard
      </RouterLink>
      <RouterLink
        to="/leads"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
        active-class="bg-indigo-50 text-indigo-600"
      >
        <Users class="h-4 w-4 shrink-0" />
        Leads
      </RouterLink>
    </nav>
  </aside>
</template>

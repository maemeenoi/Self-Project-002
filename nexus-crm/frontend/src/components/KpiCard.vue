<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  subtitle?: string
}>()
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <p class="text-sm font-medium text-gray-500">{{ title }}</p>
    <p class="mt-2 text-3xl font-bold text-gray-900">{{ value }}</p>
    <p v-if="subtitle" class="mt-1 text-sm text-gray-400">{{ subtitle }}</p>
  </div>
</template>

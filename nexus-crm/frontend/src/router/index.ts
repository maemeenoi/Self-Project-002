import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import LeadsView from '@/views/LeadsView.vue'
import LeadDetailView from '@/views/LeadDetailView.vue'
import LeadFormView from '@/views/LeadFormView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: DashboardView },
    { path: '/leads', component: LeadsView },
    { path: '/leads/new', component: LeadFormView },
    { path: '/leads/:id', component: LeadDetailView },
    { path: '/leads/:id/edit', component: LeadFormView },
  ],
})

export default router

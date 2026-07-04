import { useAuth } from '@/composables/auth/useAuth.ts'
import { watch } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/sign-up',
      name: 'sign-up',
      component: () => import('../views/SignUpView.vue'),
    },
    {
      path: '/app',
      redirect: '/app/bills',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'bills',
          name: 'bills',
          component: () => import('../views/BillsView.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('../views/SettingsView.vue'),
        },
      ],
    },
  ],
})
const { session, loading } = useAuth()

watch(session, (newSession) => {
  const onAuthPage = ['login', 'sign-up'].includes(router.currentRoute.value.name as string)
  if (newSession && onAuthPage) {
    router.push({ name: 'bills' })
  }
})

// Wait for auth to load before each navigation to ensure we have the correct auth state, if loading is false the auth state is there.
const waitForAuth = () =>
  new Promise<void>((resolve) => {
    if (!loading.value) return resolve()
    const stop = watch(loading, (val) => {
      if (!val) {
        stop()
        resolve()
      }
    })
  })

router.beforeEach(async (to) => {
  await waitForAuth()

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  if (requiresAuth && !session.value) {
    return { name: 'login' }
  }
  if ((to.name === 'login' || to.name === 'sign-up') && session.value) {
    return { name: 'bills' }
  }
})

export default router

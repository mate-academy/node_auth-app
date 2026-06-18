import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const routes = [
  { path: '/', redirect: '/profile' },
  {
    path: '/login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    component: () => import('../pages/RegisterPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/oauth',
    component: () => import('../pages/OAuthPage.vue'),
    meta: { public: true },
  },
  {
    path: '/reset-password',
    component: () => import('../pages/ResetPasswordPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/reset-password/:confirmToken',
    component: () => import('../pages/ConfirmResetPasswordPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/profile',
    component: () => import('../pages/ProfilePage.vue'),
    meta: { auth: true },
  },
  {
    path: '/activation/:activationToken',
    component: () => import('../pages/ActivationPage.vue'),
    meta: { public: true },
  },
  {
    path: '/change-email/:confirmToken',
    component: () => import('../pages/ConfirmChangeEmailPage.vue'),
    meta: { public: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (to.meta.public) {
    return;
  }

  if (!auth.user && !auth.accessToken) {
    try {
      await auth.refresh();
    } catch {}
  }

  if (to.meta.auth && !auth.user) {
    return '/login';
  }

  if (to.meta.guest && auth.user) {
    return '/profile';
  }
});

export default router;

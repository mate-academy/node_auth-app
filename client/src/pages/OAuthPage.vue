<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

onMounted(() => {
  const { accessToken, user } = route.query;

  if (accessToken && user) {
    auth.setAuth(JSON.parse(decodeURIComponent(user)), accessToken);
    router.push('/profile');
  } else {
    router.push('/login');
  }
});
</script>

<template>
  <div class="page">
    <p style="color: var(--text-muted)">Redirecting…</p>
  </div>
</template>

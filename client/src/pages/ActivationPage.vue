<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import api from '../api/index.js';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const res = await api.get(`/api/activation/${route.params.activationToken}`);
    auth.setAuth(res.data.user, res.data.accessToken);
    setTimeout(() => router.push('/profile'), 1500);
  } catch {
    error.value = 'Activation link is invalid or expired.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page">
    <div class="card text-center">
      <template v-if="loading">
        <p style="color: var(--text-muted)">Activating your account…</p>
      </template>
      <template v-else-if="error">
        <div class="alert alert--error">{{ error }}</div>
        <RouterLink to="/login" class="link">Go to sign in</RouterLink>
      </template>
      <template v-else>
        <div class="alert alert--success">Account activated! Redirecting…</div>
      </template>
    </div>
  </div>
</template>

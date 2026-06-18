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
    const res = await api.get(`/api/change-email/${route.params.confirmToken}`);

    if (typeof auth.refresh === 'function') {
      await auth.refresh();
    }

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
        <p style="color: var(--text-muted)">Verifying your new email…</p>
      </template>
      <template v-else-if="error">
        <div class="alert alert--error">{{ error }}</div>
        <RouterLink to="/profile" class="link">Go to profile</RouterLink>
      </template>
      <template v-else>
        <div class="alert alert--success">Email successfully changed! Redirecting…</div>
      </template>
    </div>
  </div>
</template>

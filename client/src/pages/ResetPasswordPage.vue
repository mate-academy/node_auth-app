<script setup>
import { ref } from 'vue';
import { authApi } from '../api/auth.js';

const email = ref('');
const loading = ref(false);
const success = ref(false);
const error = ref(null);

const submit = async () => {
  loading.value = true;
  error.value = null;
  try {
    await authApi.resetPassword(email.value);
    success.value = true;
  } catch (err) {
    error.value = err.response?.data || 'Something went wrong';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="page">
    <div class="card">
      <h1 class="card__title">Reset password</h1>
      <p class="card__subtitle">Enter your email and we'll send a reset link</p>

      <div v-if="success" class="alert alert--success">
        Check your email for a reset link.
      </div>

      <template v-if="!success">
        <div class="form-group">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="you@example.com"
            @keyup.enter="submit"
          />
        </div>

        <div v-if="error?.errors?.email" class="alert alert--error">
          {{ error.errors.email }}
        </div>

        <button class="btn" :disabled="loading" @click="submit">
          {{ loading ? 'Sending…' : 'Send reset link' }}
        </button>
      </template>

      <p
        class="text-center mt-24"
        style="color: var(--text-muted); font-size: 14px"
      >
        <RouterLink to="/login" class="link">Back to sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

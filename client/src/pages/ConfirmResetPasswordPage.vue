<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { authApi } from '../api/auth.js';

const route = useRoute();
const newPassword = ref('');
const confirmedPassword = ref('');
const loading = ref(false);
const success = ref(false);
const errors = ref(null);

const submit = async () => {
  loading.value = true;
  errors.value = null;
  try {
    await authApi.confirmResetPassword(
      route.params.confirmToken,
      newPassword.value,
      confirmedPassword.value,
    );
    success.value = true;
  } catch (err) {
    errors.value = err.response?.data?.errors || {
      general: err.response?.data?.message || 'Something went wrong',
    };
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="page">
    <div class="card">
      <h1 class="card__title">New password</h1>
      <p class="card__subtitle">Choose a new password for your account</p>

      <div v-if="success" class="alert alert--success">
        Password changed.
        <RouterLink to="/login" class="link">Sign in</RouterLink>
      </div>

      <div v-if="errors?.general" class="alert alert--error">
        {{ errors.general }}
      </div>

      <template v-if="!success">
        <div class="form-group">
          <label>New password</label>
          <input
            v-model="newPassword"
            type="password"
            placeholder="Min. 6 characters"
            :class="{ error: errors?.newPassword }"
          />
        </div>

        <div class="form-group">
          <label>Confirm new password</label>
          <input
            v-model="confirmedPassword"
            type="password"
            placeholder="Repeat password"
            :class="{ error: errors?.newPassword }"
          />
          <p v-if="errors?.newPassword" class="field-error">
            {{ errors.newPassword }}
          </p>
        </div>

        <button class="btn" :disabled="loading" @click="submit">
          {{ loading ? 'Saving…' : 'Save new password' }}
        </button>
      </template>
    </div>
  </div>
</template>

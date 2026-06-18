<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth.js';

const auth = useAuthStore();
const name = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const success = ref(false);
const errors = ref(null);

const submit = async () => {
  loading.value = true;
  errors.value = null;
  const ok = await auth.register(name.value, email.value, password.value);
  if (ok) {
    success.value = true;
  } else {
    errors.value = auth.error;
  }
  loading.value = false;
};
</script>

<template>
  <div class="page">
    <div class="card">
      <h1 class="card__title">Create account</h1>
      <p class="card__subtitle">Fill in your details to get started</p>

      <div v-if="success" class="alert alert--success">
        Check your email to activate your account.
      </div>

      <template v-if="!success">
        <div v-if="errors?.general" class="alert alert--error">
          {{ errors.general }}
        </div>

        <div class="form-group">
          <label>Name</label>
          <input
            v-model="name"
            type="text"
            placeholder="John Doe"
            :class="{ error: errors?.name }"
          />
          <p v-if="errors?.name" class="field-error">{{ errors.name }}</p>
        </div>

        <div class="form-group">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="you@example.com"
            :class="{ error: errors?.email }"
          />
          <p v-if="errors?.email" class="field-error">{{ errors.email }}</p>
        </div>

        <div class="form-group">
          <label>Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="Min. 6 characters"
            :class="{ error: errors?.password }"
          />
          <p v-if="errors?.password" class="field-error">
            {{ errors.password }}
          </p>
        </div>

        <button class="btn" :disabled="loading" @click="submit">
          {{ loading ? 'Creating account…' : 'Create account' }}
        </button>

        <div class="divider">or</div>

        <a href="http://localhost:3005/auth/google" class="btn btn--oauth">
          <img src="https://www.google.com/favicon.ico" width="18" />
          Continue with Google
        </a>

        <a href="http://localhost:3005/auth/github" class="btn btn--oauth">
          <img src="https://github.com/favicon.ico" width="18" />
          Continue with GitHub
        </a>
      </template>

      <p
        class="text-center mt-24"
        style="color: var(--text-muted); font-size: 14px"
      >
        Already have an account?
        <RouterLink to="/login" class="link">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.btn--oauth {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 11px;
  font-size: 15px;
  font-family: var(--font-body);
  margin-top: 10px;
  transition: border-color var(--transition);
  width: 100%;
}

.btn--oauth:hover {
  border-color: var(--accent);
}

.divider {
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  margin: 16px 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 42%;
  height: 1px;
  background: var(--border);
}

.divider::before {
  left: 0;
}
.divider::after {
  right: 0;
}
</style>

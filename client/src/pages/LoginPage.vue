<script setup>
import { ref } from 'vue';
import { Eye, EyeOff } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth.js';

const auth = useAuthStore();
const email = ref('');
const password = ref('');
const showPassword = ref(false);

const submit = async () => {
  auth.error = null;
  await auth.login(email.value, password.value);
};
</script>

<template>
  <div class="page">
    <div class="card">
      <h1 class="card__title">Welcome back</h1>
      <p class="card__subtitle">Sign in to your account</p>

      <div class="form-group">
        <label>Email</label>
        <input
          v-model="email"
          type="email"
          placeholder="you@example.com"
          :class="{ error: auth.error?.errors?.email }"
          @keyup.enter="submit"
        />
        <p v-if="auth.error?.errors?.email" class="field-error">
          {{ auth.error.errors.email }}
        </p>
      </div>

      <div class="form-group">
        <label>Password</label>
        <div class="input-wrapper">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            :class="{ error: auth.error?.errors?.password }"
            @keyup.enter="submit"
          />
          <button
            class="toggle-password"
            type="button"
            @click="showPassword = !showPassword"
          >
            <EyeOff v-if="showPassword" :size="18" />
            <Eye v-else :size="18" />
          </button>
        </div>
        <p v-if="auth.error?.errors?.password" class="field-error">
          {{ auth.error.errors.password }}
        </p>
      </div>

      <div v-if="auth.error?.message" class="alert alert--error">
        {{ auth.error.message }}
      </div>

      <button class="btn" :disabled="auth.loading" @click="submit">
        {{ auth.loading ? 'Signing in…' : 'Sign in' }}
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

      <div class="text-center mt-16">
        <RouterLink to="/reset-password" class="link"
          >Forgot password?</RouterLink
        >
      </div>

      <p
        class="text-center mt-16"
        style="color: var(--text-muted); font-size: 14px"
      >
        No account?
        <RouterLink to="/register" class="link">Create one</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.input-wrapper {
  position: relative;
}

.input-wrapper input {
  padding-right: 44px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  line-height: 1;
  color: var(--text-muted);
}

.toggle-password:hover {
  color: var(--text);
}

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

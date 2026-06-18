<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { profileApi } from '../api/profile.js';

const auth = useAuthStore();

const initials = computed(() => {
  const name = auth.user?.name || '';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const newName = ref('');
const nameLoading = ref(false);
const nameSuccess = ref(false);
const nameErrors = ref(null);

const submitName = async () => {
  nameLoading.value = true;
  nameSuccess.value = false;
  nameErrors.value = null;
  try {
    const res = await profileApi.changeName(newName.value);
    auth.user = res.data;
    newName.value = '';
    nameSuccess.value = true;
  } catch (err) {
    nameErrors.value = err.response?.data?.errors || {
      general: 'Failed to update name',
    };
  } finally {
    nameLoading.value = false;
  }
};

const emailPassword = ref('');
const newEmail = ref('');
const emailLoading = ref(false);
const emailSuccess = ref(false);
const emailErrors = ref(null);

const submitEmail = async () => {
  emailLoading.value = true;
  emailSuccess.value = false;
  emailErrors.value = null;
  try {
    await profileApi.changeEmail(emailPassword.value, newEmail.value);
    emailSuccess.value = true;
  } catch (err) {
    emailErrors.value = err.response?.data?.errors || {
      general: 'Failed to change email',
    };
  } finally {
    emailLoading.value = false;
  }
};

const oldPassword = ref('');
const newPassword = ref('');
const confirmedPassword = ref('');
const passLoading = ref(false);
const passSuccess = ref(false);
const passErrors = ref(null);

const submitPassword = async () => {
  passLoading.value = true;
  passSuccess.value = false;
  passErrors.value = null;
  try {
    await profileApi.changePassword(
      oldPassword.value,
      newPassword.value,
      confirmedPassword.value,
    );
    passSuccess.value = true;
    oldPassword.value = '';
    newPassword.value = '';
    confirmedPassword.value = '';
  } catch (err) {
    passErrors.value = err.response?.data?.errors || {
      general: err.response?.data?.message || 'Failed to change password',
    };
  } finally {
    passLoading.value = false;
  }
};

const handleLogout = () => auth.logout();

onMounted(async () => {
  try {
    const res = await profileApi.getProfile();
    auth.user = res.data;
  } catch {}
});
</script>

<template>
  <div class="profile-layout">
    <header class="profile-header">
      <span class="logo">Auth App</span>
      <button class="btn btn--ghost logout-btn" @click="handleLogout">
        Sign out
      </button>
    </header>

    <main class="profile-main">
      <div class="profile-hero">
        <div class="avatar">{{ initials }}</div>
        <div>
          <h1 class="profile-name">{{ auth.user?.name }}</h1>
          <p class="profile-email">{{ auth.user?.email }}</p>
        </div>
      </div>

      <section class="profile-section">
        <h2 class="section-title">Change name</h2>
        <div v-if="nameSuccess" class="alert alert--success">Name updated.</div>
        <div v-if="nameErrors?.general" class="alert alert--error">
          {{ nameErrors.general }}
        </div>
        <div class="form-row">
          <div class="form-group" style="flex: 1">
            <label>New name</label>
            <input
              v-model="newName"
              type="text"
              placeholder="Your name"
              :class="{ error: nameErrors?.name }"
            />
            <p v-if="nameErrors?.name" class="field-error">
              {{ nameErrors.name }}
            </p>
          </div>
          <button
            class="btn section-btn"
            :disabled="nameLoading"
            @click="submitName"
          >
            {{ nameLoading ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </section>

      <section class="profile-section">
        <h2 class="section-title">Change email</h2>
        <div v-if="emailSuccess" class="alert alert--success">
          Confirmation sent to your new email.
        </div>
        <div v-if="emailErrors?.general" class="alert alert--error">
          {{ emailErrors.general }}
        </div>
        <template v-if="!emailSuccess">
          <div class="form-group">
            <label>Current password</label>
            <input
              v-model="emailPassword"
              type="password"
              placeholder="••••••••"
              :class="{ error: emailErrors?.oldPassword }"
            />
            <p v-if="emailErrors?.oldPassword" class="field-error">
              {{ emailErrors.oldPassword }}
            </p>
          </div>
          <div class="form-row">
            <div class="form-group" style="flex: 1">
              <label>New email</label>
              <input
                v-model="newEmail"
                type="email"
                placeholder="new@example.com"
              />
            </div>
            <button
              class="btn section-btn"
              :disabled="emailLoading"
              @click="submitEmail"
            >
              {{ emailLoading ? 'Sending…' : 'Send link' }}
            </button>
          </div>
        </template>
      </section>

      <section class="profile-section">
        <h2 class="section-title">Change password</h2>
        <div v-if="passSuccess" class="alert alert--success">
          Password changed.
        </div>
        <div v-if="passErrors?.general" class="alert alert--error">
          {{ passErrors.general }}
        </div>
        <template v-if="!passSuccess">
          <div class="form-group">
            <label>Current password</label>
            <input
              v-model="oldPassword"
              type="password"
              placeholder="••••••••"
            />
            <p v-if="passErrors?.oldPassword" class="field-error">
              {{ passErrors.oldPassword }}
            </p>
          </div>
          <div class="form-group">
            <label>New password</label>
            <input
              v-model="newPassword"
              type="password"
              placeholder="Min. 6 characters"
            />
          </div>
          <div class="form-group">
            <label>Confirm new password</label>
            <input
              v-model="confirmedPassword"
              type="password"
              placeholder="Repeat password"
              :class="{ error: passErrors?.newPassword }"
            />
            <p v-if="passErrors?.newPassword" class="field-error">
            </p>
          </div>
          <button class="btn" :disabled="passLoading" @click="submitPassword">
            {{ passLoading ? 'Saving…' : 'Change password' }}
          </button>
        </template>
      </section>
    </main>
  </div>
</template>

<style scoped>
.profile-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 40px;
  border-bottom: 1px solid var(--border);
}

.logo {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.3px;
}

.logout-btn {
  width: auto;
  margin-top: 0;
  padding: 8px 18px;
  font-size: 14px;
}

.profile-main {
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  padding: 48px 24px;
}

.profile-hero {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 48px;
}

.avatar {
  width: 60px;
  height: 60px;
  background: var(--accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.profile-name {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.profile-email {
  color: var(--text-muted);
  font-size: 14px;
  margin-top: 2px;
}

.profile-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 28px;
  margin-bottom: 20px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  letter-spacing: -0.2px;
}

.form-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.section-btn {
  width: auto;
  flex-shrink: 0;
  padding: 11px 20px;
}
</style>

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { authApi } from '../api/auth.js';
import router from '../router/index.js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const accessToken = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const setAuth = (userData, token) => {
    user.value = userData;
    accessToken.value = token;
  };

  const clearAuth = () => {
    user.value = null;
    accessToken.value = null;
  };

  const register = async (name, email, password) => {
    loading.value = true;
    error.value = null;

    try {
      await authApi.register(name, email, password);

      return true;
    } catch (err) {
      error.value = err.response?.data?.errors || 'Registration failed';

      return false;
    } finally {
      loading.value = false;
    }
  };

  const login = async (email, password) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await authApi.login(email, password);

      setAuth(res.data.user, res.data.accessToken);
      router.push('/profile');

      return true;
    } catch (err) {
      error.value = err.response?.data || 'Login failed';

      return false;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  const refresh = async () => {
    try {
      const res = await authApi.refresh();

      setAuth(res.data.user, res.data.accessToken);
    } catch {
      clearAuth();
      throw new Error('Refresh failed');
    }
  };

  return {
    user,
    accessToken,
    loading,
    error,
    register,
    login,
    logout,
    refresh,
    setAuth,
    clearAuth,
  };
});

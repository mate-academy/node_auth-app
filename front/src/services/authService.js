import { authClient } from "../http/authClient.js";
import { httpClient } from "../http/httpClient.js";
const BASE_URL = "http://localhost:5000";

function register({ email, fullName, password }) {
  return authClient.post(`${BASE_URL}/registration`, {
    email,
    fullName,
    password,
  });
}

function login({ email, password }) {
  return authClient.post(`${BASE_URL}/login`, { email, password });
}

function reauth(email, password) {
  return authClient.post(`${BASE_URL}/reauth`, { email, password });
}

function logout() {
  return authClient.post(`${BASE_URL}/logout`);
}

function activate(activationToken) {
  return authClient.get(`${BASE_URL}/activation/${activationToken}`);
}

function recover(email) {
  return authClient.get(`${BASE_URL}/recover/${email}`);
}

function checkRecoverToken(email, token) {
  return authClient.post(`${BASE_URL}/checkRecoverToken`, { email, token });
}

function reset(email, password) {
  return authClient.post(`${BASE_URL}/reset`, {
    email,
    password,
  });
}

function resetAuth(email, password) {
  return httpClient.post(`${BASE_URL}/resetAuth`, {
    email,
    password,
  });
}

function refresh() {
  return authClient.get(`${BASE_URL}/refresh`);
}

export const authService = {
  register,
  login,
  logout,
  activate,
  refresh,
  recover,
  checkRecoverToken,
  reset,
  resetAuth,
  reauth,
};

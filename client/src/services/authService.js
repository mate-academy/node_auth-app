import { authClient } from "../http/authClient";

function register({ email, password }) {
  return authClient.post("/registration", { email, password });
}

function login({ email, password }) {
  return authClient.post("/login", { email, password });
}

function sendResetEmailForPassword({ email }) {
  return authClient.post("/reset-password", { email });
}

function checkResetPasswordToken(resetPasswordToken) {
  return authClient.get(`/reset-password/${resetPasswordToken}`);
}

function resetPassword({ password }, resetPasswordToken) {
  return authClient.post(`/reset-password/${resetPasswordToken}`, { password });
}

function logout() {
  return authClient.post("/logout");
}

function activate(activationToken) {
  return authClient.get(`/activation/${activationToken}`);
}

function refresh() {
  return authClient.get("/refresh");
}

export const authService = {
  register,
  login,
  logout,
  sendResetEmailForPassword,
  checkResetPasswordToken,
  resetPassword,
  activate,
  refresh,
};

/* eslint-disable max-len */
/* eslint-disable no-undef */
'use strict';

redirectIfAuthenticated();

const loginForm = document.getElementById('loginForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const authMessage = document.getElementById('authMessage');
const forgotEmailInput = document.getElementById('forgotEmail');
const showForgotPasswordLink = document.getElementById(
  'showForgotPasswordLink',
);
const backToLoginFromForgot = document.getElementById('backToLoginFromForgot');

showForgotPasswordLink.addEventListener('click', (e) => {
  e.preventDefault();
  clearMessage(authMessage);
  loginForm.hidden = true;
  forgotPasswordForm.hidden = false;
});

backToLoginFromForgot.addEventListener('click', (e) => {
  e.preventDefault();
  clearMessage(authMessage);
  forgotPasswordForm.hidden = true;
  loginForm.hidden = false;
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessage(authMessage);

  const submitBtn = e.target.querySelector('button[type="submit"]');

  submitBtn.disabled = true;

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const { ok, data } = await apiRequest('/auth/login', {
      body: { email, password },
    });

    if (!ok) {
      showMessage(authMessage, data?.message || 'Помилка входу', 'error');
      return;
    }

    if (!data.accessToken) {
      showMessage(
        authMessage,
        data.message || 'Підтвердіть email перед входом',
        'error',
      );
      return;
    }

    session.set(data.user, data.accessToken);
    window.location.href = '/pages/profile.html';
  } catch (err) {
    showMessage(
      authMessage,
      "Не вдалося з'єднатися з сервером: " + err.message,
      'error',
    );
  } finally {
    submitBtn.disabled = false;
  }
});

forgotPasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessage(authMessage);

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  const email = forgotEmailInput.value.trim();

  try {
    const { ok, data } = await apiRequest('/auth/forgot-password', {
      body: { email },
    });

    if (!ok) {
      showMessage(
        authMessage,
        data?.message || 'Не вдалося надіслати лист',
        'error',
      );
      return;
    }

    forgotPasswordForm.reset();

    showMessage(
      authMessage,
      'Якщо такий email зареєстрований, на нього надіслано лист із посиланням для відновлення пароля.',
      'success',
    );
  } catch (err) {
    showMessage(
      authMessage,
      "Не вдалося з'єднатися з сервером: " + err.message,
      'error',
    );
  } finally {
    submitBtn.disabled = false;
  }
});

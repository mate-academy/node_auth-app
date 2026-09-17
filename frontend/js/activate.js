/* eslint-disable no-undef */
'use strict';

const activateMessage = document.getElementById('activateMessage');
const activateBackToAuth = document.getElementById('activateBackToAuth');

async function runActivation(token) {
  try {
    const { ok, data } = await apiRequest(
      `/auth/activation/${encodeURIComponent(token)}`,
      { method: 'GET' },
    );

    if (!ok || !data?.accessToken) {
      showMessage(
        activateMessage,
        data?.message || 'Не вдалося активувати акаунт',
        'error',
      );
      activateBackToAuth.hidden = false;
      return;
    }

    showMessage(
      activateMessage,
      'Акаунт активовано! Тепер увійдіть у систему.',
      'success',
    );

    setTimeout(() => {
      window.location.href = '/pages/login.html';
    }, 1200);
  } catch (err) {
    showMessage(
      activateMessage,
      "Не вдалося з'єднатися з сервером: " + err.message,
      'error',
    );
    activateBackToAuth.hidden = false;
  }
}

const token = extractToken('token', 'activation');

if (!token) {
  showMessage(
    activateMessage,
    'Токен активації не знайдено в адресі.',
    'error',
  );
  activateBackToAuth.hidden = false;
} else {
  runActivation(token);
}

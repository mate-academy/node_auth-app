/* eslint-disable no-undef */
'use strict';

const oauthMessage = document.getElementById('oauthMessage');
const oauthBackToLogin = document.getElementById('oauthBackToLogin');

async function completeOAuthLogin() {
  const accessToken = new URLSearchParams(window.location.search).get(
    'accessToken',
  );

  if (!accessToken) {
    showMessage(
      oauthMessage,
      'Не вдалося завершити вхід — токен відсутній у посиланні.',
      'error',
    );
    oauthBackToLogin.hidden = false;
    return;
  }

  localStorage.setItem('accessToken', accessToken);

  try {
    const { ok, data } = await apiRequest('/profile', {
      method: 'GET',
      auth: true,
    });

    if (!ok) {
      session.clear();
      showMessage(oauthMessage, 'Не вдалося завершити вхід.', 'error');
      oauthBackToLogin.hidden = false;
      return;
    }

    session.setUser(data);
    window.location.href = '/pages/profile.html';
  } catch (err) {
    session.clear();

    showMessage(
      oauthMessage,
      "Не вдалося з'єднатися з сервером: " + err.message,
      'error',
    );
    oauthBackToLogin.hidden = false;
  }
}

completeOAuthLogin();

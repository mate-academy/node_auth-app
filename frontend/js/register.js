/* eslint-disable no-undef */
'use strict';

// Сторінка реєстрації (register.html).
// Залежить від api.js, dom.js, main.js (redirectIfAuthenticated).

redirectIfAuthenticated();

const registerForm = document.getElementById('registerForm');
const authMessage = document.getElementById('authMessage');
const registerEmailError = document.getElementById('registerEmailError');
const registerPasswordError = document.getElementById('registerPasswordError');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessage(authMessage);
  registerEmailError.textContent = '';
  registerPasswordError.textContent = '';

  const submitBtn = e.target.querySelector('button[type="submit"]');

  submitBtn.disabled = true;

  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  try {
    const { ok, status, data } = await apiRequest('/auth/register', {
      body: { name, email, password },
    });

    if (!ok) {
      if (status === 400 && data?.errors) {
        registerEmailError.textContent = data.errors.email || '';
        registerPasswordError.textContent = data.errors.password || '';
      }
      showMessage(authMessage, data?.message || 'Помилка реєстрації', 'error');
      return;
    }

    registerForm.reset();

    showMessage(
      authMessage,
      'Реєстрація успішна! Перевірте пошту для активації акаунта, ' +
        'а тоді увійдіть.',
      'success',
    );

    setTimeout(() => {
      window.location.href = '/pages/login.html';
    }, 1500);
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

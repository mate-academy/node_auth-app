/* eslint-disable no-undef */
'use strict';

// Сторінка скидання пароля (reset-password.html). Бекенд шле лист з
// посиланням ".../auth/reset-password/<token>" — цей шлях перенаправляється
// сюди через frontend/serve.json (rewrite), а сам токен беремо з хвоста
// шляху (або з ?resetToken=) через extractToken() з main.js.
// Залежить від api.js, dom.js, main.js.

const resetPasswordForm = document.getElementById('resetPasswordForm');
const resetPasswordInput = document.getElementById('resetPasswordInput');
const resetConfirmPasswordInput = document.getElementById(
  'resetConfirmPasswordInput',
);
const resetPasswordMessage = document.getElementById('resetPasswordMessage');

const resetToken = extractToken('resetToken', 'reset-password');

if (!resetToken) {
  showMessage(resetPasswordMessage, 'Токен не знайдено в адресі.', 'error');
  resetPasswordForm.hidden = true;
}

resetPasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessage(resetPasswordMessage);

  const submitBtn = e.target.querySelector('button[type="submit"]');

  submitBtn.disabled = true;

  const password = resetPasswordInput.value;
  const confirmPassword = resetConfirmPasswordInput.value;

  if (password !== confirmPassword) {
    showMessage(resetPasswordMessage, 'Паролі не співпадають', 'error');
    submitBtn.disabled = false;
    return;
  }

  try {
    const { ok, data } = await apiRequest(
      `/auth/reset-password/${encodeURIComponent(resetToken)}`,
      { body: { password, confirmPassword } },
    );

    if (!ok) {
      showMessage(
        resetPasswordMessage,
        data?.message || 'Не вдалося змінити пароль',
        'error',
      );
      return;
    }

    showMessage(
      resetPasswordMessage,
      'Пароль змінено! Тепер увійдіть з новим паролем.',
      'success',
    );

    setTimeout(() => {
      window.location.href = '/pages/login.html';
    }, 1200);
  } catch (err) {
    showMessage(
      resetPasswordMessage,
      "Не вдалося з'єднатися з сервером: " + err.message,
      'error',
    );
  } finally {
    submitBtn.disabled = false;
  }
});

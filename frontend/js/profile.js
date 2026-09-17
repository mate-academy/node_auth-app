/* eslint-disable no-undef */
'use strict';

const infoId = document.getElementById('infoId');
const infoName = document.getElementById('infoName');
const infoEmail = document.getElementById('infoEmail');

const nameForm = document.getElementById('nameForm');
const nameInput = document.getElementById('nameInput');
const nameMessage = document.getElementById('nameMessage');

const emailForm = document.getElementById('emailForm');
const emailInput = document.getElementById('emailInput');
const confirmEmailInput = document.getElementById('confirmEmailInput');
const emailPasswordInput = document.getElementById('emailPasswordInput');
const emailMessage = document.getElementById('emailMessage');

const setPasswordPanel = document.getElementById('setPasswordPanel');
const setPasswordForm = document.getElementById('setPasswordForm');
const setPasswordNewInput = document.getElementById('setPasswordNewInput');
const setPasswordConfirmInput = document.getElementById(
  'setPasswordConfirmInput',
);
const setPasswordMessage = document.getElementById('setPasswordMessage');

const updatePasswordPanel = document.getElementById('updatePasswordPanel');
const sendPasswordChangeLinkBtn = document.getElementById(
  'sendPasswordChangeLinkBtn',
);
const passwordMessage = document.getElementById('passwordMessage');

const showUpdatePasswordLink = document.getElementById(
  'showUpdatePasswordLink',
);
const showSetPasswordLink = document.getElementById('showSetPasswordLink');

// GET /profile не повідомляє, чи в юзера вже є пароль (OAuth-акаунт без
// нього, чи звичайний) — тож замість автоматичного визначення даємо ручний
// перемикач між панелями (посилання showSetPasswordLink/showUpdatePasswordLink
// нижче) плюс автоперемикання назад на "Змінити пароль" одразу після
// успішного встановлення пароля.
function showSetPasswordPanel(errorMessage) {
  setPasswordPanel.hidden = false;
  updatePasswordPanel.hidden = true;

  if (errorMessage) {
    showMessage(setPasswordMessage, errorMessage, 'error');
  }
}

function showUpdatePasswordPanel(errorMessage) {
  updatePasswordPanel.hidden = false;
  setPasswordPanel.hidden = true;

  if (errorMessage) {
    showMessage(passwordMessage, errorMessage, 'error');
  }
}

showSetPasswordLink.addEventListener('click', (e) => {
  e.preventDefault();
  clearMessage(passwordMessage);
  showSetPasswordPanel();
});

showUpdatePasswordLink.addEventListener('click', (e) => {
  e.preventDefault();
  clearMessage(setPasswordMessage);
  showUpdatePasswordPanel();
});

function renderUser(user) {
  infoId.textContent = user.id;
  infoName.textContent = user.name;
  infoEmail.textContent = user.email;
  nameInput.value = user.name;
  emailInput.value = user.email;
}

async function init() {
  const { ok, status, data } = await apiRequest('/profile', {
    method: 'GET',
    auth: true,
  });

  if (!ok) {
    if (status === 401) {
      session.clear();
      window.location.href = '/pages/login.html';
    }

    return;
  }

  session.setUser(data);
  renderUser(data);
}

nameForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessage(nameMessage);

  const submitBtn = e.target.querySelector('button[type="submit"]');

  submitBtn.disabled = true;

  try {
    const { ok, data } = await apiRequest('/profile/name', {
      method: 'PATCH',
      auth: true,
      body: { name: nameInput.value.trim() },
    });

    if (!ok) {
      showMessage(
        nameMessage,
        data?.message || "Не вдалося оновити ім'я",
        'error',
      );
      return;
    }

    session.setUser(data);
    renderUser(data);
    showMessage(nameMessage, "Ім'я оновлено", 'success');
  } catch (err) {
    showMessage(
      nameMessage,
      "Не вдалося з'єднатися з сервером: " + err.message,
      'error',
    );
  } finally {
    submitBtn.disabled = false;
  }
});


emailForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessage(emailMessage);

  const submitBtn = e.target.querySelector('button[type="submit"]');

  submitBtn.disabled = true;

  const email = emailInput.value.trim();
  const confirmEmail = confirmEmailInput.value.trim();
  const password = emailPasswordInput.value;

  if (email !== confirmEmail) {
    showMessage(emailMessage, 'Email та підтвердження не співпадають', 'error');
    submitBtn.disabled = false;
    return;
  }

  try {
    const { ok, data } = await apiRequest('/profile/email', {
      method: 'PATCH',
      auth: true,
      body: { email, confirmEmail, password },
    });

    if (!ok) {
      showMessage(
        emailMessage,
        data?.message || 'Не вдалося оновити email',
        'error',
      );

      return;
    }

    session.setUser(data);
    renderUser(data);
    emailPasswordInput.value = '';
    showMessage(emailMessage, 'Email оновлено', 'success');
  } catch (err) {
    showMessage(
      emailMessage,
      "Не вдалося з'єднатися з сервером: " + err.message,
      'error',
    );
  } finally {
    submitBtn.disabled = false;
  }
});


setPasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessage(setPasswordMessage);

  const submitBtn = e.target.querySelector('button[type="submit"]');

  submitBtn.disabled = true;

  const newPassword = setPasswordNewInput.value;
  const confirmPassword = setPasswordConfirmInput.value;

  if (newPassword !== confirmPassword) {
    showMessage(setPasswordMessage, 'Паролі не співпадають', 'error');
    submitBtn.disabled = false;

    return;
  }

  try {
    const { ok, data } = await apiRequest('/profile/set-password', {
      method: 'POST',
      auth: true,
      body: { newPassword, confirmPassword },
    });

    if (!ok) {
      // Бекенд каже, що пароль уже є — значить, вгадали не ту панель
      // (GET /profile не повідомляє, чи є пароль). Перемикаємось і
      // передаємо це саме повідомлення користувачу.
      if (data?.message?.includes('already set')) {
        showUpdatePasswordPanel(data.message);

        return;
      }

      showMessage(
        setPasswordMessage,
        data?.message || 'Не вдалося встановити пароль',
        'error',
      );

      return;
    }

    // Пароль щойно з'явився — далі це вже акаунт з паролем, тож
    // перемикаємось на панель "Змінити пароль" і показуємо успіх там.
    setPasswordForm.reset();
    showUpdatePasswordPanel();
    showMessage(passwordMessage, 'Пароль встановлено', 'success');
  } catch (err) {
    showMessage(
      setPasswordMessage,
      "Не вдалося з'єднатися з сервером: " + err.message,
      'error',
    );
  } finally {
    submitBtn.disabled = false;
  }
});

sendPasswordChangeLinkBtn.addEventListener('click', async () => {
  clearMessage(passwordMessage);
  sendPasswordChangeLinkBtn.disabled = true;

  const email = session.getUser()?.email;

  try {
    const { ok, data } = await apiRequest('/auth/forgot-password', {
      body: { email },
    });

    if (!ok) {
      showMessage(
        passwordMessage,
        data?.message || 'Не вдалося надіслати лист',
        'error',
      );

      return;
    }

    showMessage(
      passwordMessage,
      'Перевірте пошту — ми надіслали посилання для зміни пароля.',
      'success',
    );
  } catch (err) {
    showMessage(
      passwordMessage,
      "Не вдалося з'єднатися з сервером: " + err.message,
      'error',
    );
  } finally {
    sendPasswordChangeLinkBtn.disabled = false;
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch {}

  session.clear();
  window.location.href = '/pages/login.html';
});

if (requireAuth()) {
  init();
}

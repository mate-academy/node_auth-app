import * as authApi from '../api/authApi.mjs';

const form = document.querySelector('.form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const data = Object.fromEntries(formData);
  const response = await authApi.forgotPassword(data);

  if (!response.ok && response.status !== 404) {
    const message = await response.json();
    const input = form.email;
    const label = input.labels[0];

    label.classList.add('form--has-error');
    label.setAttribute('data-error', message);

    input.addEventListener(
      'input',
      () => {
        label.classList.remove('form--has-error');
        label.removeAttribute('data-error');
      },
      { once: true },
    );

    return;
  }

  window.location.replace('/send-message');
});

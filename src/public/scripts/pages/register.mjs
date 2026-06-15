import * as authApi from '../api/authApi.mjs';

const form = document.querySelector('.form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const registerData = Object.fromEntries(formData);
  const respons = await authApi.register(registerData);

  if (!respons.ok) {
    const errors = await respons.json();

    for (const key in errors) {
      const input = form[key];
      const label = input.previousElementSibling;

      label.classList.add('form--has-error');
      label.setAttribute('data-error', errors[key]);

      input.addEventListener(
        'input',
        () => {
          label.classList.remove('form--has-error');
          label.removeAttribute('data-error');
        },
        { once: true },
      );
    }

    return;
  }

  const newUrl = `${window.location.origin}/auth/activate`;

  window.location.replace(newUrl);
});

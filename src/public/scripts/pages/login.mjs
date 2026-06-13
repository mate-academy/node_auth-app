import * as authApi from '../api/authApi.mjs';

const form = document.querySelector('.form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formInputs = document.querySelector('.wrapper-inputs');

  formInputs.classList.remove('bad-login');

  const formData = new FormData(e.currentTarget);
  const loginData = Object.fromEntries(formData);
  const respons = await authApi.login(loginData);

  if (!respons.ok) {
    return formInputs.classList.add('bad-login');
  }

  const newUrl = `${window.location.origin}/profile`;

  window.location.replace(newUrl);
});

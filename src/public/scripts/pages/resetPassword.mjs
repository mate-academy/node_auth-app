import * as authApi from '../api/authApi.mjs';

const form = document.querySelector('.form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const data = Object.fromEntries(formData);
  const response = await authApi.resetPassword(data);

  if (!response.ok) {
    const responsInfo = await response.json();

    if (Object.hasOwn(responsInfo, 'fields')) {
      for (const key in responsInfo.fields) {
        const input = form[key];
        const label = input.labels[0];

        label.classList.add('form--has-error');
        label.setAttribute('data-error', responsInfo.fields[key]);

        input.addEventListener(
          'input',
          () => {
            label.classList.remove('form--has-error');
            label.removeAttribute('data-error');
          },
          { once: true },
        );
      }
    }

    return;
  }

  window.location.replace('/auth/reset-password/succes');
});

// label.classList.add('form--has-error');
// label.setAttribute('data-error', message);

// input.addEventListener(
//   'input',
//   () => {
//     label.classList.remove('form--has-error');
//     label.removeAttribute('data-error');
//   },
//   { once: true },
// );

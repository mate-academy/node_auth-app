import * as profileApi from '../api/profileApi.mjs';

const changeNameButton = document.querySelector('#change-name-button');
const changePasswordButton = document.querySelector('#change-password-button');
const changeEmailButton = document.querySelector('#change-email-button');

changeNameButton.addEventListener('click', () => {
  const form = document.querySelector('#name-form');
  const cancelButton = form.querySelector('.cancel-button');

  changeNameButton.setAttribute('hidden', 'true');
  form.removeAttribute('hidden');

  const handleSubmite = async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const respons = await profileApi.changeName(data);

    if (!respons.ok) {
      const { message } = await respons.json();
      const errSpan = form.querySelector('.profile-form__error-message');

      if (errSpan) {
        errSpan.innerText = message;
      } else {
        const messageElement = document.createElement('span');

        messageElement.innerText = message;
        messageElement.classList = 'profile-form__error-message';

        form.append(messageElement);
      }

      return;
    }

    window.location.reload();
  };

  const handleCloseButton = (e) => {
    form.querySelector('.profile-form__error-message')?.remove();

    form.removeEventListener('submit', handleSubmite);
    form.setAttribute('hidden', 'true');
    changeNameButton.removeAttribute('hidden');
  };

  form.addEventListener('submit', handleSubmite);
  cancelButton.addEventListener('click', handleCloseButton, { once: true });
});

changeEmailButton.addEventListener('click', () => {
  const form = document.querySelector('#email-form');
  const cancelButton = form.querySelector('.cancel-button');

  changeEmailButton.setAttribute('hidden', 'true');
  form.removeAttribute('hidden');

  const handleSubmite = async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const respons = await profileApi.changeEmail(data);

    if (!respons.ok) {
      const { message } = await respons.json();
      const errSpan = form.querySelector('.profile-form__error-message');

      if (errSpan) {
        errSpan.innerText = message;
      } else {
        const messageElement = document.createElement('span');

        messageElement.innerText = message;
        messageElement.classList = 'profile-form__error-message';

        form.append(messageElement);
      }

      return;
    }

    window.location.href = '/send-message';
  };

  const handleCloseButton = (e) => {
    form.querySelector('.profile-form__error-message')?.remove();

    form.removeEventListener('submit', handleSubmite);
    form.setAttribute('hidden', 'true');
    changeEmailButton.removeAttribute('hidden');
  };

  form.addEventListener('submit', handleSubmite);
  cancelButton.addEventListener('click', handleCloseButton, { once: true });
});

changePasswordButton.addEventListener('click', () => {
  const form = document.querySelector('#password-form');
  const cancelButton = form.querySelector('.cancel-button');

  changePasswordButton.setAttribute('hidden', 'true');
  form.removeAttribute('hidden');

  const handleSubmite = async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const respons = await profileApi.changePassword(data);

    if (!respons.ok) {
      const { message } = await respons.json();
      const errSpan = form.querySelector('.profile-form__error-message');

      if (errSpan) {
        errSpan.innerText = message;
      } else {
        const messageElement = document.createElement('span');

        messageElement.innerText = message;
        messageElement.classList = 'profile-form__error-message';

        form.append(messageElement);
      }

      return;
    }

    window.location.reload();
  };

  const handleCloseButton = (e) => {
    form.querySelector('.profile-form__error-message')?.remove();

    form.removeEventListener('submit', handleSubmite);
    form.setAttribute('hidden', 'true');
    changePasswordButton.removeAttribute('hidden');
  };

  form.addEventListener('submit', handleSubmite);
  cancelButton.addEventListener('click', handleCloseButton, { once: true });
});

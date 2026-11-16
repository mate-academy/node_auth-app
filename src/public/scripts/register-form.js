const form = document.querySelector('form');
const button = document.querySelector('button');
const nam = document.querySelector('.name');
const namError = document.querySelector('.name-error');
const email = document.querySelector('.email');
const emailError = document.querySelector('.email-error');
const password = document.querySelector('.password');
const passwordError = document.querySelector('.password-error');
const confirm = document.querySelector('.confirm-password');
const confirmError = document.querySelector('.confirm-password-error');
const identicalError = document.querySelector('.identical-error');
const lengError = document.querySelector('.leng-error');
const symbolError = document.querySelector('.symbol-error');

button.addEventListener('click', function (e) {
  e.preventDefault();

  validate(nam, namError);
  validate(email, emailError);
  validate(password, passwordError);
  validate(confirm, confirmError);

  if (confirm.value.trim() !== password.value.trim()) {
    identicalError.classList.add('show-error');
  } else {
    identicalError.classList.remove('show-error');
  }

  if (password.value.length < 6) {
    lengError.classList.add('show-error');
  } else {
    lengError.classList.remove('show-error');
  }

  if (!/[^\w\s]/.test(password.value)) {
    symbolError.classList.add('show-error');
  } else {
    symbolError.classList.remove('show-error');
  }

  const hasErrors = document.querySelector('.show-error');

  if (!hasErrors) {
    form.submit();
  }
});

// function - validate the inputs

function validate(input, error) {
  if (input.value.trim() === '') {
    error.classList.add('show-error');

    return false;
  } else {
    error.classList.remove('show-error');

    return true;
  }
}

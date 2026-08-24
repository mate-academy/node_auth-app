'use strict';

const passwordInputs = document.querySelectorAll('input[type="password"]');

document.querySelectorAll('.password-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const input = button.parentElement.querySelector('input');
    const isVisible = input.type === 'text';

    input.type = isVisible ? 'password' : 'text';
    button.textContent = isVisible ? 'Show' : 'Hide';

    button.setAttribute(
      'aria-label',
      isVisible ? 'Show password' : 'Hide password',
    );
  });
});

const rulesBox = document.querySelector('[data-password-rules]');

if (rulesBox && passwordInputs.length) {
  const password = document.querySelector('input[name="password"]');
  const checks = [
    (value) => value.length >= 8,
    (value) => /[A-Z]/.test(value),
    (value) => /[a-z]/.test(value),
    (value) => /\d/.test(value),
    (value) => /[^A-Za-z0-9]/.test(value),
  ];
  const ruleItems = rulesBox.querySelectorAll('li');
  const strength = rulesBox.querySelector('[data-strength]');
  const bar = rulesBox.querySelector('[data-strength-bar]');

  password.addEventListener('input', () => {
    const passed = checks.filter((check) => check(password.value)).length;

    ruleItems.forEach((item, index) => {
      item.classList.toggle('is-valid', checks[index](password.value));
    });

    strength.textContent = [
      'Not started',
      'Very weak',
      'Weak',
      'Fair',
      'Good',
      'Strong',
    ][passed];
    bar.style.width = `${passed * 20}%`;
  });
}

document.querySelectorAll('form').forEach((form) => {
  form.addEventListener('submit', () => {
    const button = form.querySelector('button[type="submit"]');

    if (button) {
      button.classList.add('is-loading');
    }
  });
});

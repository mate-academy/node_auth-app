'use strict';

const { PASSWORD_RULES } = require('../utils/passwordRules');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function layout(title, content) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px;
      margin: 48px auto; padding: 0 20px; line-height: 1.5; }
    form { display: grid; gap: 12px; margin: 20px 0; }
    input, button { padding: 10px; font: inherit; }
    fieldset { display: grid; gap: 10px; }
    .error { color: #b00020; }
    nav { display: flex; gap: 12px; margin-bottom: 24px; }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
}

function renderLoginPage(message = '') {
  return layout(
    'Login',
    `<h1>Login</h1>
${message ? `<p class="error">${escapeHtml(message)}</p>` : ''}
<form method="post" action="/login">
  <label>Email <input type="email" name="email" required></label>
  <label>Password <input type="password" name="password" required></label>
  <button type="submit">Login</button>
</form>
<p><a href="/register">Create an account</a></p>
<p><a href="/forgot-password">Forgot password?</a></p>`,
  );
}

function renderRegisterPage(message = '') {
  const rules = PASSWORD_RULES.map(
    (rule) => `<li>${escapeHtml(rule)}</li>`,
  ).join('');

  return layout(
    'Register',
    `<h1>Create account</h1>
${message ? `<p class="error">${escapeHtml(message)}</p>` : ''}
<p>Password rules:</p><ul>${rules}</ul>
<form method="post" action="/register">
  <label>Name <input name="name" maxlength="100" required></label>
  <label>Email <input type="email" name="email" required></label>
  <label>Password <input type="password" name="password" required></label>
  <button type="submit">Register</button>
</form>
<p><a href="/login">Already registered? Login</a></p>`,
  );
}

function renderForgotPasswordPage(message = '') {
  return layout(
    'Reset password',
    `<h1>Reset password</h1>
${message ? `<p class="error">${escapeHtml(message)}</p>` : ''}
<form method="post" action="/forgot-password">
  <label>Email <input type="email" name="email" required></label>
  <button type="submit">Send reset email</button>
</form>
<p><a href="/login">Back to login</a></p>`,
  );
}

function renderResetPasswordPage(token, message = '') {
  return layout(
    'Choose a new password',
    `<h1>Choose a new password</h1>
${message ? `<p class="error">${escapeHtml(message)}</p>` : ''}
<form method="post" action="/reset-password/${escapeHtml(token)}">
  <label>New password
    <input type="password" name="password" required>
  </label>
  <label>Confirmation
    <input type="password" name="confirmation" required>
  </label>
  <button type="submit">Reset password</button>
</form>`,
  );
}

function renderProfilePage(user, message = '') {
  return layout(
    'Profile',
    `<nav><strong>Profile</strong>
<form method="post" action="/logout" style="display:inline">
  <button type="submit">Logout</button>
</form></nav>
<h1>${escapeHtml(user.name)}</h1>
<p>${escapeHtml(user.email)}</p>
${message ? `<p>${escapeHtml(message)}</p>` : ''}
<fieldset><legend>Change name</legend>
<form method="post" action="/profile/name">
  <input name="name" value="${escapeHtml(user.name)}" required>
  <button type="submit">Save name</button>
</form></fieldset>
<fieldset><legend>Change password</legend>
<form method="post" action="/profile/password">
  <input type="password" name="oldPassword"
    placeholder="Current password" required>
  <input type="password" name="newPassword"
    placeholder="New password" required>
  <input type="password" name="confirmation"
    placeholder="Confirm new password" required>
  <button type="submit">Change password</button>
</form></fieldset>
<fieldset><legend>Change email</legend>
<form method="post" action="/profile/email">
  <input type="email" name="email" placeholder="New email" required>
  <input type="email" name="emailConfirmation"
    placeholder="Confirm new email" required>
  <input type="password" name="password" placeholder="Password" required>
  <button type="submit">Change email</button>
</form></fieldset>`,
  );
}

function renderMessagePage(title, message, linkHref, linkText) {
  const link = linkHref
    ? `<p><a href="${escapeHtml(linkHref)}">${escapeHtml(linkText)}</a></p>`
    : '';

  return layout(
    title,
    `<h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p>${link}`,
  );
}

function renderErrorPage(statusCode, message) {
  return layout(
    `${statusCode} Error`,
    `<h1>${statusCode}</h1><p>${escapeHtml(message)}</p>` +
      '<p><a href="/">Go home</a></p>',
  );
}

module.exports = {
  escapeHtml,
  renderErrorPage,
  renderForgotPasswordPage,
  renderLoginPage,
  renderMessagePage,
  renderProfilePage,
  renderRegisterPage,
  renderResetPasswordPage,
};

'use strict';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function layout({ title, eyebrow = 'Secure account', body, wide = false }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)} · Gatehouse</title><link rel="stylesheet" href="/styles.css"></head>
<body><main class="shell ${wide ? 'wide' : ''}"><a class="brand" href="/"><span>G</span> Gatehouse</a>
<section class="card"><p class="eyebrow">${escapeHtml(eyebrow)}</p>${body}</section>
<p class="footer">Private by design · Protected with encrypted credentials</p></main></body></html>`;
}

function alert(message, type = 'error') {
  return message
    ? `<div class="alert ${type}">${escapeHtml(message)}</div>`
    : '';
}

function field({
  label,
  name,
  type = 'text',
  value = '',
  autocomplete = '',
  required = true,
  hint = '',
}) {
  return `<label>${escapeHtml(label)}<input name="${name}" type="${type}" value="${escapeHtml(value)}" ${autocomplete ? `autocomplete="${autocomplete}"` : ''} ${required ? 'required' : ''}>${hint ? `<small>${hint}</small>` : ''}</label>`;
}

function authPage({ mode, error, values = {} }) {
  const register = mode === 'register';
  let nameField = '';

  if (register) {
    nameField = field({
      label: 'Full name',
      name: 'name',
      value: values.name,
      autocomplete: 'name',
    });
  }

  const emailField = field({
    label: 'Email address',
    name: 'email',
    type: 'email',
    value: values.email,
    autocomplete: 'email',
  });
  const passwordField = field({
    label: 'Password',
    name: 'password',
    type: 'password',
    autocomplete: register ? 'new-password' : 'current-password',
    hint: register
      ? 'At least 8 characters, with uppercase, lowercase and a number.'
      : '',
  });

  return layout({
    title: register ? 'Create account' : 'Welcome back',
    eyebrow: register ? 'Start your account' : 'Member access',
    body: `<h1>${register ? 'Create your account' : 'Welcome back'}</h1><p class="lede">${register ? 'A calm, secure home for your account.' : 'Sign in to manage your profile.'}</p>
${alert(error)}<form method="post" action="/${mode}">
${nameField}
${emailField}
${passwordField}
<button type="submit">${register ? 'Create account' : 'Sign in'} <span>→</span></button></form>
<div class="links">${register ? 'Already a member? <a href="/login">Sign in</a>' : '<a href="/forgot-password">Forgot password?</a><span>New here? <a href="/register">Create account</a></span>'}</div>`,
  });
}

function messagePage({
  title,
  message,
  actionHref,
  actionLabel,
  detail = '',
  type = 'success',
}) {
  return layout({
    title,
    body: `<div class="status-icon ${type}">${type === 'success' ? '✓' : '!'}</div><h1>${escapeHtml(title)}</h1><p class="lede">${escapeHtml(message)}</p>${detail ? `<p class="detail">${detail}</p>` : ''}${actionHref ? `<a class="button" href="${actionHref}">${escapeHtml(actionLabel)} <span>→</span></a>` : ''}`,
  });
}

module.exports = {
  alert,
  authPage,
  escapeHtml,
  field,
  layout,
  messagePage,
};

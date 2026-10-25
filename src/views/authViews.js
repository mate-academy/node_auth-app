'use strict';

const components = require('./components');
const layout = require('./layout');

function emailForm(ctx, action, button) {
  return [
    `<form method="post" action="${action}">`,
    components.csrfInput(ctx),
    components.field(ctx, {
      label: 'Email',
      name: 'email',
      type: 'email',
      autocomplete: 'email',
    }),
    `<button type="submit">${button}</button></form>`,
  ].join('\n');
}

function register(ctx, data) {
  const content = [
    '<h1>Create account</h1>',
    components.errorList(data.errors),
    '<form method="post" action="/register">',
    components.csrfInput(ctx),
    components.field(ctx, {
      label: 'Name',
      name: 'name',
      value: data.values.name,
      autocomplete: 'name',
    }),
    components.field(ctx, {
      label: 'Email',
      name: 'email',
      type: 'email',
      value: data.values.email,
      autocomplete: 'email',
    }),
    components.field(ctx, {
      label: 'Password',
      name: 'password',
      type: 'password',
      autocomplete: 'new-password',
      rules: true,
    }),
    '<button type="submit">Register</button></form>',
    '<p class="muted">Already have an account?',
    '<a href="/login">Log in</a></p>',
  ].join('\n');

  return layout(ctx, 'Create account', components.card(content));
}

function registerSent(ctx) {
  const content = [
    '<h1>Check your email</h1>',
    '<p>If the address can be registered, we sent an activation link',
    'to it. Your account will be active only after you confirm your',
    'email.</p>',
    '<p class="muted">The link expires in 24 hours.',
    "Didn't get it?</p>",
    emailForm(ctx, '/resend-activation', 'Resend activation email'),
  ].join('\n');

  return layout(ctx, 'Check your email', components.card(content));
}

function activationFailed(ctx) {
  const content = [
    '<h1>Activation link invalid</h1>',
    '<p>This link is invalid or has expired. Request a new one:</p>',
    emailForm(ctx, '/resend-activation', 'Resend activation email'),
  ].join('\n');

  return layout(ctx, 'Activation failed', components.card(content));
}

function inactiveNotice(ctx, email) {
  return [
    '<div class="alert info">',
    'Your account is not active yet. Please open the activation link',
    'we emailed you.',
    '<form method="post" action="/resend-activation">',
    components.csrfInput(ctx),
    `<input type="hidden" name="email" value="${components.esc(email)}">`,
    '<button class="link" type="submit">',
    'Send the activation email again</button></form></div>',
  ].join('\n');
}

function login(ctx, data) {
  const notice = data.inactive ? inactiveNotice(ctx, data.values.email) : '';
  const content = [
    '<h1>Log in</h1>',
    components.errorList(data.errors),
    notice,
    '<form method="post" action="/login">',
    components.csrfInput(ctx),
    components.field(ctx, {
      label: 'Email',
      name: 'email',
      type: 'email',
      value: data.values.email,
      autocomplete: 'email',
    }),
    components.field(ctx, {
      label: 'Password',
      name: 'password',
      type: 'password',
      autocomplete: 'current-password',
    }),
    '<button type="submit">Log in</button></form>',
    '<p class="muted"><a href="/password-reset">Forgot your password?</a>',
    '&middot; <a href="/register">Create account</a></p>',
  ].join('\n');

  return layout(ctx, 'Log in', components.card(content));
}

module.exports = {
  register,
  registerSent,
  activationFailed,
  login,
};

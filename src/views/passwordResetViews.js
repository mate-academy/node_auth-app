'use strict';

const components = require('./components');
const layout = require('./layout');

function request(ctx) {
  const content = [
    '<h1>Reset password</h1>',
    '<p class="muted">Enter your email and we will send you a link',
    'to choose a new password.</p>',
    '<form method="post" action="/password-reset">',
    components.csrfInput(ctx),
    components.field(ctx, {
      label: 'Email',
      name: 'email',
      type: 'email',
      autocomplete: 'email',
    }),
    '<button type="submit">Send reset link</button></form>',
    '<p class="muted"><a href="/login">Back to login</a></p>',
  ].join('\n');

  return layout(ctx, 'Reset password', components.card(content));
}

function sent(ctx) {
  const content = [
    '<h1>Email sent</h1>',
    '<p>If an account exists for that email, you will receive a link',
    'to reset your password shortly.</p>',
    '<p class="muted">The link expires in 1 hour.</p>',
    '<p><a href="/login">Back to login</a></p>',
  ].join('\n');

  return layout(ctx, 'Email sent', components.card(content));
}

function form(ctx, data) {
  const content = [
    '<h1>Choose a new password</h1>',
    components.errorList(data.errors),
    `<form method="post" action="/password-reset/${data.token}">`,
    components.csrfInput(ctx),
    components.field(ctx, {
      label: 'New password',
      name: 'password',
      type: 'password',
      autocomplete: 'new-password',
      rules: true,
    }),
    components.field(ctx, {
      label: 'Confirmation',
      name: 'confirmation',
      type: 'password',
      autocomplete: 'new-password',
    }),
    '<button type="submit">Reset password</button></form>',
  ].join('\n');

  return layout(ctx, 'Choose a new password', components.card(content));
}

function invalid(ctx) {
  const content = [
    '<h1>Link invalid or expired</h1>',
    '<p>Please <a href="/password-reset">request a new reset link</a>.</p>',
  ].join('\n');

  return layout(ctx, 'Link expired', components.card(content));
}

function success(ctx) {
  const content = [
    '<h1>Password updated</h1>',
    '<p>Your password was changed successfully.</p>',
    '<p><a href="/login">Go to login</a></p>',
  ].join('\n');

  return layout(ctx, 'Password updated', components.card(content));
}

module.exports = {
  request,
  sent,
  form,
  invalid,
  success,
};

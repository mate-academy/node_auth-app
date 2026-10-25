'use strict';

const components = require('./components');
const layout = require('./layout');

function headerCard(ctx) {
  const content = [
    '<h1>Profile</h1>',
    '<p class="muted">Signed in as',
    `<strong>${components.esc(ctx.currentUser.email)}</strong></p>`,
  ].join('\n');

  return components.card(content);
}

function nameCard(ctx, data) {
  const current = ctx.currentUser.name;
  const value = data.values.name === undefined ? current : data.values.name;
  const content = [
    '<h2>Name</h2>',
    components.errorList(data.errors.name),
    '<form method="post" action="/profile/name">',
    components.csrfInput(ctx),
    components.field(ctx, {
      label: 'Name',
      name: 'name',
      id: 'profileName',
      value,
      autocomplete: 'name',
    }),
    '<button type="submit">Save name</button></form>',
  ].join('\n');

  return components.card(content);
}

function passwordCard(ctx, data) {
  const content = [
    '<h2>Change password</h2>',
    components.errorList(data.errors.password),
    '<form method="post" action="/profile/password">',
    components.csrfInput(ctx),
    components.field(ctx, {
      label: 'Current password',
      name: 'oldPassword',
      id: 'oldPassword',
      type: 'password',
      autocomplete: 'current-password',
    }),
    components.field(ctx, {
      label: 'New password',
      name: 'password',
      id: 'newPassword',
      type: 'password',
      autocomplete: 'new-password',
      rules: true,
    }),
    components.field(ctx, {
      label: 'Confirmation',
      name: 'confirmation',
      id: 'newPasswordConfirmation',
      type: 'password',
      autocomplete: 'new-password',
    }),
    '<button type="submit">Change password</button></form>',
  ].join('\n');

  return components.card(content);
}

function emailCard(ctx, data) {
  const content = [
    '<h2>Change email</h2>',
    components.errorList(data.errors.email),
    '<form method="post" action="/profile/email">',
    components.csrfInput(ctx),
    components.field(ctx, {
      label: 'Password',
      name: 'password',
      id: 'emailPassword',
      type: 'password',
      autocomplete: 'current-password',
    }),
    components.field(ctx, {
      label: 'New email',
      name: 'email',
      id: 'newEmail',
      type: 'email',
      value: data.values.email,
      autocomplete: 'email',
    }),
    components.field(ctx, {
      label: 'Confirm new email',
      name: 'emailConfirmation',
      id: 'newEmailConfirmation',
      type: 'email',
      value: data.values.emailConfirmation,
      autocomplete: 'email',
    }),
    '<button type="submit">Change email</button></form>',
  ].join('\n');

  return components.card(content);
}

function index(ctx, data) {
  const content = [
    headerCard(ctx),
    nameCard(ctx, data),
    passwordCard(ctx, data),
    emailCard(ctx, data),
  ].join('\n');

  return layout(ctx, 'Profile', content);
}

module.exports = {
  index,
};

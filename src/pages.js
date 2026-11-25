'use strict';

const { randomToken, passwordRule } = require('./security');

const field = (name, label, type, autocomplete, value = '', hint = '') => ({
  name,
  label,
  type,
  autocomplete,
  value,
  hint,
});

const nameField = (value) => field('name', 'Name', 'text', 'name', value);

const emailField = (value) => field('email', 'Email', 'email', 'email', value);

const currentPassword = (name = 'password', label = 'Password') =>
  field(name, label, 'password', 'current-password');

const newPassword = (label = 'New password') =>
  field('password', label, 'password', 'new-password', '', passwordRule);

const confirmation = () =>
  field('confirmation', 'Confirm password', 'password', 'new-password');

const form = (action, button, fields = [], token = '') => ({
  action,
  button,
  fields,
  token,
});

const link = (href, label) => ({
  href,
  label,
});

const loginLink = link('/login', 'Log in');

function page(
  req,
  res,
  title,
  { status = 200, message = '', error = '', forms = [], links = [] } = {},
) {
  if (forms.length) {
    req.session.csrf ||= randomToken();
  }

  return res.status(status).render('page', {
    title,
    message,
    error,
    forms,
    links,
    csrf: req.session?.csrf,
  });
}

function registerPage(
  req,
  res,
  { name = '', email = '', error = '', status = 200 } = {},
) {
  return page(req, res, 'Register', {
    status,
    error,
    forms: [
      form('/register', 'Register', [
        nameField(name),
        emailField(email),
        newPassword('Password'),
      ]),
    ],
    links: [loginLink],
  });
}

function loginPage(req, res, { email = '', error = '', status = 200 } = {}) {
  return page(req, res, 'Log in', {
    status,
    error,
    forms: [form('/login', 'Log in', [emailField(email), currentPassword()])],
    links: [
      link('/register', 'Create an account'),
      link('/forgot-password', 'Forgot password?'),
    ],
  });
}

function profilePage(
  req,
  res,
  { status = 200, error = '', message = '' } = {},
) {
  return page(req, res, 'Profile', {
    status,
    error,
    message:
      'Current email: ' + req.user.email + (message ? ' · ' + message : ''),

    forms: [
      form('/profile/name', 'Save name', [nameField(req.user.name)]),

      form('/profile/password', 'Change password', [
        currentPassword('oldPassword', 'Old password'),
        newPassword(),
        confirmation(),
      ]),

      form('/profile/email', 'Request email change', [
        field('email', 'New email', 'email', 'email'),
        field('emailConfirmation', 'Confirm new email', 'email', 'off'),
        currentPassword(),
      ]),

      form('/logout', 'Log out'),
    ],
  });
}

function invalidLink(req, res) {
  return page(req, res, 'Link unavailable', {
    status: 400,
    error: 'This link is invalid, expired, or already used.',
    links: [loginLink],
  });
}

module.exports = {
  form,
  link,
  page,
  loginLink,
  emailField,
  newPassword,
  confirmation,
  registerPage,
  loginPage,
  profilePage,
  invalidLink,
};

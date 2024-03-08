'use strict';

const ACTIVATION_ACCOUNT_WAY = 'account-activation';
const ACTIVATION_PASSWORD_WAY = 'password-activation';
const ACTIVATION_EMAIL_WAY = 'email-activation';

const DEF_MAIL_LINK_OPTIONS = {
  way: ACTIVATION_ACCOUNT_WAY,
  subject: 'Account activation',
  htmlTitle: 'Account activation',
};

const DEF_MAIL_KEY_OPTIONS = {
  subject: 'Confirm the action',
  htmlTitle: 'Confirm the action',
};

module.exports = {
  ACTIVATION_ACCOUNT_WAY,
  ACTIVATION_PASSWORD_WAY,
  ACTIVATION_EMAIL_WAY,
  DEF_MAIL_LINK_OPTIONS,
  DEF_MAIL_KEY_OPTIONS,
};

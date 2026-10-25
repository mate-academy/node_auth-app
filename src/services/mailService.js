'use strict';

const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

const usingSmtp = Boolean(config.mail.host);

function buildTransport() {
  if (!usingSmtp) {
    return nodemailer.createTransport({
      streamTransport: true,
      buffer: true,
    });
  }

  const options = {
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.port === 465,
  };

  if (config.mail.user) {
    options.auth = {
      user: config.mail.user,
      pass: config.mail.pass,
    };
  }

  return nodemailer.createTransport(options);
}

const transport = buildTransport();

function send(to, subject, lines) {
  const text = lines.join('\n');

  if (!usingSmtp) {
    const preview = [
      '',
      '=== EMAIL ===',
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      text,
      '=============',
      '',
    ].join('\n');

    logger.log(preview);
  }

  return transport
    .sendMail({
      from: config.mail.from,
      to,
      subject,
      text,
    })
    .catch((error) => {
      logger.logError('[mail] failed to send:', error.message);
    });
}

function sendActivation(user, rawToken) {
  return send(user.email, 'Activate your account', [
    `Hi ${user.name},`,
    '',
    'Confirm your email to activate your account:',
    `${config.baseUrl}/activate/${rawToken}`,
    '',
    'The link expires in 24 hours.',
    'If you did not create an account, ignore this email.',
  ]);
}

function sendAlreadyRegistered(user) {
  return send(user.email, 'Someone tried to register with your email', [
    `Hi ${user.name},`,
    '',
    'Someone tried to create an account with this email,',
    'but you already have one.',
    'If it was you, log in or reset your password:',
    `${config.baseUrl}/password-reset`,
    'Otherwise, ignore this message.',
  ]);
}

function sendPasswordReset(user, rawToken) {
  return send(user.email, 'Reset your password', [
    `Hi ${user.name},`,
    '',
    'Choose a new password here:',
    `${config.baseUrl}/password-reset/${rawToken}`,
    '',
    'The link expires in 1 hour.',
    'If you did not ask for this, ignore this email.',
  ]);
}

function sendPasswordChanged(user) {
  return send(user.email, 'Your password was changed', [
    `Hi ${user.name},`,
    '',
    'Your password was changed.',
    "If this wasn't you, reset it immediately:",
    `${config.baseUrl}/password-reset`,
  ]);
}

function sendEmailChanged(user, oldEmail) {
  send(oldEmail, 'Your email address was changed', [
    `Hi ${user.name},`,
    '',
    `The email of your account changed from ${oldEmail} to ${user.email}.`,
    "If this wasn't you, contact support immediately.",
  ]);

  return send(user.email, 'Your email address was updated', [
    `Hi ${user.name},`,
    '',
    'This address is now the email of your account.',
  ]);
}

module.exports = {
  sendActivation,
  sendAlreadyRegistered,
  sendPasswordReset,
  sendPasswordChanged,
  sendEmailChanged,
};

'use strict';

require('dotenv/config');

const nodemailer = require('nodemailer');
const {
  DEF_MAIL_KEY_OPTIONS, DEF_MAIL_LINK_OPTIONS,
} = require('../defaultConfig.js');
const { createClientUrl } = require('../exceptions/createClientUrl.js');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function send({ email, subject, html }) {
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject,
    html,
  });
}

function sendActivationLink(
  email, token, options = DEF_MAIL_LINK_OPTIONS,
) {
  const { way, subject, htmlTitle } = options;
  const link = createClientUrl(`/${way}/${token}`);

  return send({
    email,
    subject,
    html: `
      <h1>${htmlTitle}</h1>
      <p>Follow the link to confirm:</p>
      <br/>
      <a href="${link}">${link}</a>
    `,
  });
}

function sendActivationKey(
  email, token, options = DEF_MAIL_KEY_OPTIONS,
) {
  const { subject, htmlTitle } = options;

  return send({
    email,
    subject,
    html: `
      <h1>${htmlTitle}</h1>
      <p>Copy this code:</p>
      <br/>
      <h3>${token}</h3>
      <br/>
      <p>Then paste it into the site for confirmation</p>
    `,
  });
}

// function sendActivationEmailLink(
//   email, token, options = DEF_MAIL_LINK_OPTIONS,
// ) {
//   const { way, subject, htmlTitle } = options;

//   const paramToken = `activationToken=${token}`;
//   const paramEmail = `newEmail=${email}`;

//   const link = createClientUrl(`/${way}?${paramEmail}&${paramToken}`);

//   return send({
//     email,
//     subject,
//     html: `
//       <h1>${htmlTitle}</h1>
//       <p>Follow the link to confirm:</p>
//       <br/>
//       <a href="${link}">${link}</a>
//     `,
//   });
// }

function sendChangeEmailNotification(oldEmail, newEmail) {
  return send({
    email: oldEmail,
    subject: 'Changing email',
    html: `
    <h1>Changing email</h1>
    <p>Email for MyApp was changed to ${newEmail}</p>
    `,
  });
}

const mail = {
  send,
  sendActivationLink,
  sendActivationKey,
  // sendActivationEmailLink,
  sendChangeEmailNotification,
};

module.exports = { mail };

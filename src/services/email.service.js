import nodemailer from 'nodemailer';
import { transporter } from '../utils/mailer.js';
import 'dotenv/config';

async function send({ email, subject, html }) {
  const trans = await transporter();

  const info = await trans.sendMail({
    to: email,
    subject,
    html,
  });

  // eslint-disable-next-line no-console
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

async function sendEmail({ email, type, token = null, id = null }) {
  let href;
  let html;
  let subject;

  switch (type) {
    case 'Activation':
      href = `${process.env.CLIENT_URL}/activate/${token}`;
      subject = 'Activation';

      html = `
<h1>Click here for activation email (48 hours) </h1>
<a href="${href}"> ${href} </a>
`;
      break;
    case 'Reset':
      href = id
        ? `${process.env.CLIENT_URL}/reset-password/${token}/${id}`
        : `${process.env.CLIENT_URL}/reset-password/${token}`;
      subject = 'Reset';

      html = `
<h1>Click here for reset password </h1>
<a href="${href}"> ${href} </a>
`;
      break;
    case 'Update':
      subject = 'Update';

      html = `
  <h1>Instructions for changing email have been sent to the new email address.</h1>
`;
      break;
    default:
      throw new Error('Unknown email type');
  }

  return send({ email, subject, html });
}

export const emailService = {
  sendEmail,
};

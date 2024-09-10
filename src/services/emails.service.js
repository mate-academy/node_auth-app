const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const send = async ({ email, subject, html }) => {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
};
// 'activate' - option, 'Activate account' - message, subj - 'Activate'
// eslint-disable-next-line max-len
// 'password-reset-confirm' - option, 'Reset Password' - message, 'Reset Password' - subj
const sendEmail = async (email, token, option, message, subj) => {
  const href = `${process.env.CLIENT_HOST}/${option}/${token}`;
  const html = `
    <h1>${message}</h1>
    <a href="${href}">${option === 'activate' ? href : 'Reset your password'}</a>
  `;

  return send({ email, html, subject: subj });
};

async function sendEmailChangeNotification(oldEmail, newEmail) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: oldEmail,
    subject: 'Email Change Notification',
    text: `Your email has been changed to ${newEmail}. If this was not you, please contact support immediately.`,
  });
}

module.exports = {
  send,
  sendEmail,
  sendEmailChangeNotification,
};

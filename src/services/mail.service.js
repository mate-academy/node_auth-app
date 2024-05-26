'use strict';

const { sendMail } = require('../services/sendMail');
const { token } = require('../services/token');

async function sendActivationEmail(email, name) {
  const payload = { name, email };
  const activateToken = token.getToken(payload, 'activate');
  const url = `http://localhost:3005/activation/${activateToken}`;

  await sendMail(email, url);
}

async function sendNotificationEmail(email) {
  await sendMail(email, '', {
    message: `Your email has been changed successfully on ${email}`,
    subject: 'notification',
    status: true,
  });
}

module.exports = {
  sendActivationEmail,
  sendNotificationEmail,
};

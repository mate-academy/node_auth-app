const { nodemailer } = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAILER_EMAIL,
    pass: process.env.MAILER_PASSWORD,
  },
});

const send = (email, subject, html) => {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    html,
  });
};

const sendActivationLink = (email, activationToken) => {
  const link = `${process.env.CLIENT_URL}/activate/${email}/${activationToken}`;
  const html = `
    <h1>Account activation</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Account activation', html);
};

module.exports = {
  send,
  sendActivationLink,
};

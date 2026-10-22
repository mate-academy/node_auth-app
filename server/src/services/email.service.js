const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
  };

  return transporter.sendMail(mailOptions);
};

const sendActivationEmail = async (to, token) => {
  const subject = 'Account Activation';
  const clientHost = process.env.CLIENT_HOST.replace(/\/$/, '');
  const text = `Please click the following link to activate your account: ${clientHost}/activate/${token}`;

  return sendEmail(to, subject, text);
};

const sendPasswordResetEmail = async (to, token) => {
  const subject = 'Password Reset';
  const clientHost = process.env.CLIENT_HOST.replace(/\/$/, '');
  const text = `Please click the following link to reset your password: ${clientHost}/reset-password/${token}`;

  return sendEmail(to, subject, text);
};

const sendEmailChangeNotification = async (oldEmail, newEmail) => {
  const subject = 'Email change requested';
  const text = `A request was made to change your account email to ${newEmail}. If you did not request this change, please contact support.`;

  return sendEmail(oldEmail, subject, text);
};

const emailService = {
  sendActivationEmail,
  sendPasswordResetEmail,
  sendEmailChangeNotification,
};

module.exports = { emailService };

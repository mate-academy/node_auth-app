const createTransport = require('nodemailer').createTransport({
  service: 'gmail',
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendActivationLink = async (to, link) => {
  const transporter = await createTransport.sendMail({
    from: process.env.SMTP_FROM,
    to: to,
    subject: 'Activation Link',
    text: 'You need to activate your account, check your email',
    html: `<div>
        <h1>To activate follow the link</h1>
        <a href='${process.env.CLIENT_HOST}/auth/activate/${link}'>${link}</a>
      </div>`,
  });

  return transporter;
};

const sendResetLink = async (to, link) => {
  const transporter = await createTransport.sendMail({
    from: process.env.SMTP_FROM,
    to: to,
    subject: 'Reset Password',
    text: 'Reset Password',
    html: `<div>
        <h1>To activate follow the link</h1>
        <a href='${process.env.CLIENT_HOST}/password-reset/${link}'>${link}</a>
      </div>`,
  });

  return transporter;
};

const sendEmailNotify = async (to, newEmail) => {
  const transporter = await createTransport.sendMail({
    from: process.env.SMTP_FROM,
    to: to,
    subject: 'New email',
    text: `Your email was changed to ${newEmail} `,
  });

  return transporter;
};

module.exports = {
  sendActivationLink,
  sendResetLink,
  sendEmailNotify,
};

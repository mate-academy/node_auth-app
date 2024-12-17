const configOptions = require('nodemailer').createTransport({
  service: 'gmail',
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendActivationLink = async (to, link) => {
  const activationLink = await configOptions.sendMail({
    from: 'ab3mn3@gmail.com',
    to: to,
    subject: 'Activation Link',
    text: 'You need to activate your account, check your email',
    html: `<div>
        <h1>To activate follow the link</h1>
        <a href='${process.env.CLIENT_HOST}/auth/activate/${link}'>${link}</a>
      </div>`,
  });

  return activationLink;
};

const sendResetLink = async (to, link) => {
  const activationLink = await configOptions.sendMail({
    from: 'ab3mn3@gmail.com',
    to: to,
    subject: 'Reset Password',
    text: 'Reset Password',
    html: `<div>
        <h1>To activate follow the link</h1>
        <a href='${process.env.CLIENT_HOST}/password-reset/${link}'>${link}</a>
      </div>`,
  });

  return activationLink;
};

module.exports = {
  sendActivationLink,
  sendResetLink,
};

const nodemailer = require('nodemailer');

const createTransporter = async () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tech.rj.1405@gmail.com',
      pass: 'ctckjkwethbhtiwl',
    },
  });
};

const sendActivationEmail = async (email, activationToken) => {
  const transporter = await createTransporter();

  const activationLink = `http://localhost:5700/auth/activate/${activationToken}`;

  const mailContent = {
    from: 'tech.rj.1405@gmail.com',
    to: email,
    subject: 'Node Auth app Account Activation',
    html: `
      <h1>Welcome to Our Node Auth App !</h1>
      <p>To activate your account, please click the link below:</p>
      <a href="${activationLink}">Activate Account</a>
    `,
  };

  try {
    const sendStatus = await transporter.sendMail(mailContent);

    if (sendStatus) {
      return 'Activation Mail sent successfully';
    }
  } catch (err) {
    return err;
  }
};

const sendMail = async (mailContent) => {
  const transporter = await createTransporter();

  try {
    const sendStatus = await transporter.sendMail(mailContent);

    if (sendStatus) {
      return { success: true };
    }
  } catch (err) {
    return { success: false, message: err };
  }
};

const emailService = { createTransporter, sendActivationEmail, sendMail };

module.exports = emailService;

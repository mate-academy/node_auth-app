import 'dotenv/config';
import configs from '../configs/index.config.js';

const send = async (args) => {
  const info = await configs.transporter.sendMail({
    from: process.env.MAILER_USER,
    ...args,
  });

  const mail = {
    ...(info.accepted.length && { accepted: info.accepted }),
    ...(info.rejected.length && { rejected: info.rejected }),
    emails: {
      sender: info.envelope.from,
      receiver: info.envelope.to,
    },
  };

  return mail;
};

const sendActivationEmail = async ({ to, token }) => {
  const href = `${process.env.CLIENT_HOST}/auth/activate/${token}`;
  const html = `
  <h1>Activate account</h1>
  <a href="${href}">${href}</a>
  `;

  await send({
    to,
    subject: 'Activate your account',
    text: html,
  });

  return {
    token,
    send,
  };
};

const mailService = {
  send,
  sendActivationEmail,
};

export default mailService;

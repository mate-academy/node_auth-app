import { sendEmail } from './emailService.js';

export const sendActivationEmail = async (to, token) => {
  const frontendUrl = process.env.FRONTEND_URL;
  const activationLink = `${frontendUrl}/activate/${token}`;

  const html = `
    <h2>Ative sua conta</h2>
    <p>Obrigado por se registrar! Clique no link abaixo para ativar sua conta:</p>
    <a href="${activationLink}">${activationLink}</a>
  `;

  await sendEmail({
    to,
    subject: 'Ative sua conta',
    html,
  });
};

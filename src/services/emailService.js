'use strict';

/**
 * EmailService — Responsável por enviar emails via Resend API.
 * Princípio da Responsabilidade Única (SRP): cuida apenas do envio de emails.
 * Princípio da Inversão de Dependência (DIP): pode ser substituído por
 * outro provedor sem alterar os serviços que o utilizam.
 */
const { Resend } = require('resend');

require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

/**
 * Envia o email de ativação de conta.
 * @param {string} email - Email do destinatário
 * @param {string} token - Token de ativação
 */
async function sendActivationEmail(email, token) {
  const activationLink = `${CLIENT_URL}/activate/${token}`;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: 'Ative sua conta',
    html: `
      <h1>Bem-vindo!</h1>
      <p>Obrigado por se registrar. Clique no link abaixo para ativar sua conta:</p>
      <a href="${activationLink}">Ativar minha conta</a>
      <p>Se você não criou esta conta, ignore este email.</p>
    `,
  });
}

/**
 * Envia o email de redefinição de senha.
 * @param {string} email - Email do destinatário
 * @param {string} token - Token de reset
 */
async function sendResetPasswordEmail(email, token) {
  const resetLink = `${CLIENT_URL}/reset-password/${token}`;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: 'Redefinição de Senha',
    html: `
      <h1>Redefinição de Senha</h1>
      <p>Você solicitou a redefinição da sua senha. Clique no link abaixo:</p>
      <a href="${resetLink}">Redefinir minha senha</a>
      <p>Este link expira em 1 hora.</p>
      <p>Se você não solicitou esta redefinição, ignore este email.</p>
    `,
  });
}

/**
 * Notifica o email antigo sobre a mudança de email.
 * @param {string} oldEmail - Email anterior
 * @param {string} newEmail - Novo email
 */
async function sendEmailChangeNotification(oldEmail, newEmail) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to: oldEmail,
    subject: 'Seu email foi alterado',
    html: `
      <h1>Alteração de Email</h1>
      <p>Seu email foi alterado para: <strong>${newEmail}</strong></p>
      <p>Se você não realizou esta alteração, entre em contato com o suporte imediatamente.</p>
    `,
  });
}

module.exports = {
  sendActivationEmail,
  sendResetPasswordEmail,
  sendEmailChangeNotification,
};

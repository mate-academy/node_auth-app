'use strict';

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendActivationEmail = async (emailAddress, token) => {
  const info = await transporter.sendMail({
    from: '"Remetente" <samuel.bezerra.fs@gmail.com>',
    to: emailAddress,
    subject: 'Ative sua conta',
    text: 'Olá! Este é um e-mail para ativar a sua n-conta.',
    html: `<a href="http://localhost:3000/activate/${token}">Ativiar conta</a>`,
  });

  return info;
};

const sendPasswordResetEmail = async (emailAddress, token) => {
  const resetPassword = await transporter.sendMail({
    from: '"Remetente" <samuel.bezerra.fs@gmail.com>',
    to: emailAddress,
    subject: 'Redefina sua senha',
    text: 'Olá! Este é um e-mail para redifinir a sua senha.',
    html: `<a href="http://localhost:3000/password-reset/${token}">Redefinir Senha</a>`,
  });

  return resetPassword;
};

module.exports = {
  sendActivationEmail,
  sendPasswordResetEmail,
};

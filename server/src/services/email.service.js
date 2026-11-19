import 'dotenv/config'
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const send = ({ email, subject, html }) => {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

export const sendActivationEmail = (email, token) => {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`
  const html = `
    <h1>Activate account</h1>
    <a href="${href}">${href}</a>
  `;

  return send({
    email, html,
    subject: 'Activate'
  })
}

export const sendChangeEmailActivation = (email, token) => {
  const href = `${process.env.CLIENT_HOST}/changeEmail/activation/${token}`
  const html = `
    <h1>Activate new email:</h1>
    <a href="${href}">${href}</a>
  `;

  return send({
    email, html,
    subject: 'Email change activation'
  })
}

export const sendChangeEmailNotification = (email, newEmail) => {
  const html = `
    <h1>Someone requested to change your email to ${newEmail}. If this wasn't you, take action</h1>
  `;

  return send({
    email, html,
    subject: 'Important: Change email notification'
  })
}

export const sendPasswordResetActivation = (token, email) => {
  const href = `${process.env.CLIENT_HOST}/passwordReset/activation/${token}`
  const html = `
    <h1>Reset password:</h1>
    <a href="${href}">${href}</a>
  `;

  return send({
    email, html,
    subject: 'Password reset'
  })
}

export const emailService = {
  send,
  sendActivationEmail,
  sendChangeEmailActivation,
  sendChangeEmailNotification,
  sendPasswordResetActivation
}

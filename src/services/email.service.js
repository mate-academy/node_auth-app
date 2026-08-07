'use strict';

const { transporter } = require('../config/mailer');

class EmailService {
  async send({ email, subject, html }) {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject,
      html,
    });
  }

  async sendActivationEmail(email, token) {
    const link = `${process.env.CLIENT_URL || process.env.API_URL}/activate/${token}`;

    await this.send({
      email,
      subject: 'Activate your account',
      html: `
        <h1>Account activation</h1>

        <p>Follow the link below to activate your account:</p>

        <a href="${link}">Activate account</a>

        <p>This link expires in 24 hours.</p>
      `,
    });
  }

  async sendResetPasswordEmail(email, token) {
    const link = `${process.env.CLIENT_URL || process.env.API_URL}/reset-password/${token}`;

    await this.send({
      email,
      subject: 'Reset your password',
      html: `
        <h1>Password reset</h1>

        <p>Follow the link below to set a new password:</p>

        <a href="${link}">Reset password</a>

        <p>This link expires in 1 hour.</p>

        <p>If you did not request it, just ignore this email.</p>
      `,
    });
  }

  async sendEmailChangeConfirmation(email, token) {
    const link = `${process.env.CLIENT_URL || process.env.API_URL}/confirm-email/${token}`;

    await this.send({
      email,
      subject: 'Confirm your new email',
      html: `
        <h1>Email confirmation</h1>

        <p>Follow the link below to confirm your new email:</p>

        <a href="${link}">Confirm email</a>

        <p>This link expires in 1 hour.</p>
      `,
    });
  }

  async sendEmailChangeNotification(email, newEmail) {
    await this.send({
      email,
      subject: 'Your email has been changed',
      html: `
        <h1>Email change</h1>

        <p>The email of your account has been changed to ${newEmail}.</p>

        <p>If it was not you, contact the support immediately.</p>
      `,
    });
  }

  async sendPasswordChangeNotification(email) {
    await this.send({
      email,
      subject: 'Your password has been changed',
      html: `
        <h1>Password change</h1>

        <p>The password of your account has been changed.</p>

        <p>If it was not you, reset your password immediately.</p>
      `,
    });
  }
}

const emailService = new EmailService();

module.exports = {
  emailService,
};

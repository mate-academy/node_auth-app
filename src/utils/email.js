'use strict';

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password',
      },
    });
  }

  async sendEmail(to, subject, html) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to,
        subject,
        html,
      });

      return { success: true };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Email sending error:', error);

      return { success: false, error };
    }
  }

  async sendActivationEmail(email, name, activationUrl) {
    const html = `
      <h1>Welcome to Auth App!</h1>
      <p>Hi ${name},</p>
      <p>Please click the link below to activate your account:</p>
      <a href="${activationUrl}">Activate Account</a>
      <p>If you didn't create this account, please ignore this email.</p>
    `;

    return this.sendEmail(email, 'Activate Your Account', html);
  }

  async sendPasswordResetEmail(email, name, resetUrl) {
    const html = `
      <h1>Password Reset Request</h1>
      <p>Hi ${name},</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    return this.sendEmail(email, 'Reset Your Password', html);
  }

  async sendEmailChangeNotification(email, name, oldEmail, newEmail) {
    const html = `
      <h1>Email Address Changed</h1>
      <p>Hi ${name},</p>
      <p>Your email address has been changed from ${oldEmail} to ${newEmail}.</p>
      <p>If you didn't make this change, please contact support immediately.</p>
    `;

    return this.sendEmail(email, 'Email Address Changed', html);
  }
}

module.exports = new EmailService();

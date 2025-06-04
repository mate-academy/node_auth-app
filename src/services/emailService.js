const { sendMail } = require('../config/email');

const sendActivationEmail = async (email, activationToken) => {
  const activationUrl = `${process.env.CLIENT_URL}/activate/${activationToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Account Activation</h2>
      <p>Thank you for registering! Please click the link below to activate your account:</p>
      <a href="${activationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
        Activate Account
      </a>
      <p>If you didn't create this account, please ignore this email.</p>
      <p>This link will expire in 24 hours.</p>
    </div>
  `;

  await sendMail(email, 'Account Activation', html);
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset</h2>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
        Reset Password
      </a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    </div>
  `;

  await sendMail(email, 'Password Reset', html);
};

const sendEmailChangeNotification = async (oldEmail, newEmail) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Email Address Changed</h2>
      <p>Your email address has been changed from <strong>${oldEmail}</strong> to <strong>${newEmail}</strong>.</p>
      <p>If you didn't make this change, please contact support immediately.</p>
      <p>This is an automated notification.</p>
    </div>
  `;

  await sendMail(oldEmail, 'Email Address Changed', html);
};

module.exports = {
  sendActivationEmail,
  sendPasswordResetEmail,
  sendEmailChangeNotification,
};

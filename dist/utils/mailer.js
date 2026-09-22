"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailer = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
require("dotenv/config");
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});
function send(email, subject, html) {
    return transporter.sendMail({
        from: 'Auth API',
        to: email,
        subject,
        html,
    });
}
function sendActivationLink(email, activationToken) {
    const link = `${process.env.CLIENT_URL}/activate/${email}/${activationToken}`;
    const html = `
    <h1>Account activation</h1>
    <a href="${link}">${link}</a>
  `;
    return send(email, 'Account activation', html);
}
function sendResetPasswordLink(email, resetToken) {
    const link = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const html = `
    <h1>Password Reset Request</h1>
    <p>You requested a password reset. Click the link below to set a new password:</p>
    <a href="${link}">${link}</a>
    <p>If you didn't request this, please ignore this email.</p>
  `;
    return send(email, 'Password Reset', html);
}
function sendEmailChangeConfirmation(email, token) {
    const link = `${process.env.API_URL}/auth/email-confirmation/${token}`;
    const html = `
    <h1>Confirm email change</h1>
    <p>You requested to change your email address.</p>
    <p>Click the link below to confirm:</p>
    <a href="${link}">${link}</a>
    <p>This link will expire in 15 minutes.</p>
  `;
    return send(email, 'Confirm email change', html);
}
function notifyEmailChanged(oldEmail, newEmail) {
    const html = `
    <h1>Email address changed</h1>
    <p>Your account email has been changed.</p>
    <p>New email: ${newEmail}</p>
    <p>
      If you did not make this change, please contact support.
    </p>
  `;
    return send(oldEmail, 'Your email address was changed', html);
}
exports.mailer = {
    send,
    sendActivationLink,
    sendResetPasswordLink,
    sendEmailChangeConfirmation,
    notifyEmailChanged,
};

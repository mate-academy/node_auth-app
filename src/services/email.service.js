import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: 'e91727a9f3264b',
    pass: 'cc953d4c422a1b',
  },
});

export async function sendActivationEmail(email, activationLink) {
  await transporter.sendMail({
    from: '"Auth App" <no-reply@authapp.com>',
    to: email,
    subject: 'Activate your account',
    html: `
      <h2>Activate your account</h2>
      <p>Click the link below to activate your account:</p>
      <a href="${activationLink}">${activationLink}</a>
    `,
  });
}

export async function sendPasswordResetEmail(email, resetLink) {
  await transporter.sendMail({
    from: '"Auth App" <no-reply@authapp.com>',
    to: email,
    subject: 'Reset your password',
    html: `
      <h2>Reset your password</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
    `,
  });
}

export async function sendEmailChangeNotification(email, newEmail) {
  await transporter.sendMail({
    from: '"Auth App" <no-reply@authapp.com>',
    to: email,
    subject: 'Email change requested',
    html: `
      <h2>Email change requested</h2>
      <p>Your email was requested to be changed to:</p>
      <p><strong>${newEmail}</strong></p>
      <p>If this was not you, please contact support.</p>
    `,
  });
}

export async function sendEmailConfirmationEmail(email, confirmLink) {
  await transporter.sendMail({
    from: '"Auth App" <no-reply@authapp.com>',
    to: email,
    subject: 'Confirm your new email',
    html: `
      <h2>Confirm your new email</h2>
      <p>Click the link below to confirm your new email:</p>
      <a href="${confirmLink}">${confirmLink}</a>
    `,
  });
}

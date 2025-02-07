import { createTransport } from 'nodemailer';
import { nodemailerMjmlPlugin } from 'nodemailer-mjml';
import { join } from 'path';

const transporter = createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secureConnection: process.env.MAIL_SECURE,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

transporter.use(
  'compile',
  nodemailerMjmlPlugin({
    templateFolder: join(import.meta.dirname, '../mailTemplates'),
  }),
);

export const sendActivationEmail = async (user, activation) => {
  const info = await transporter.sendMail({
    from: `"${process.env.MAIL_NAME}" <${process.env.MAIL_USER}>`,
    to: user.email,
    subject: 'Activate your account',
    templateName: 'activation',
    templateData: {
      host: process.env.HOST,
      name: user.name,
      activationId: activation._id,
    },
  });

  return info;
};

export const sendPasswordResetEmail = async (user, reset) => {
  const info = await transporter.sendMail({
    from: `"${process.env.MAIL_NAME}" <${process.env.MAIL_USER}>`,
    to: user.email,
    subject: 'Reset your password',
    templateName: 'reset',
    templateData: {
      host: process.env.HOST,
      name: user.name,
      resetId: reset._id,
    },
  });

  return info;
};

export const sendPasswordChangedEmail = async (user) => {
  const info = await transporter.sendMail({
    from: `"${process.env.MAIL_NAME}" <${process.env.MAIL_USER}>`,
    to: user.email,
    subject: 'Password changed',
    templateName: 'passwordChanged',
    templateData: {
      name: user.name,
    },
  });

  return info;
};

export const sendEmailChangedEmail = async (user) => {
  const info = await transporter.sendMail({
    from: `"${process.env.MAIL_NAME}" <${process.env.MAIL_USER}>`,
    to: user.email,
    subject: 'Email changed',
    templateName: 'emailChanged',
    templateData: {
      name: user.name,
    },
  });

  return info;
};

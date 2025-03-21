import nodemailer from 'nodemailer';

export const emailService = {
  sendActivationEmail: async (email, token) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Activate Your Account',
      text: `Please activate your account by clicking the link:
             http://localhost:3005}/activate/${token}`,
    };

    await transporter.sendMail(mailOptions);
  },

  sendPasswordResetEmail: async (email, token) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your Password',
      text: `Click the link to reset your password:
             http://localhost:3005/reset-password-confirm/${token}`,
    };

    await transporter.sendMail(mailOptions);
  },
};

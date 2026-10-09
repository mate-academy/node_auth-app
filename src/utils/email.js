const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 2. Define the email options
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Auth App" <noreply@authapp.com>',
      to: to,
      subject: subject,
      text: text,
    };

    // 3. Send the email
    const info = await transporter.sendMail(mailOptions);

    // eslint-disable-next-line no-console
    console.log('Message sent: %s', info.messageId);

    return info;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};

// Export the function so authController can use it
module.exports = { sendEmail };

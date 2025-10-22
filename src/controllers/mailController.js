const transporter = require('../config/nodemailer');

exports.sendMail = async ({ to, subject, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `Auth App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    return info;
  } catch (err) {
    throw new Error(err.message);
  }
};

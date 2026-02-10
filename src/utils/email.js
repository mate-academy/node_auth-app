'use strict';

// Simular envio de email (em produção, configurar SMTP real)
// const transporter = nodemailer.createTransporter({
//   host: 'smtp.example.com', // Substituir por real
//   port: 587,
//   secure: false,
//   auth: {
//     user: 'your-email@example.com',
//     pass: 'your-password',
//   },
// });

function sendActivationEmail(email, token) {
  // const mailOptions = {
  //   from: 'noreply@authapp.com',
  //   to: email,
  //   subject: 'Activate your account',
  //   html: `<p>Click <a href="http://localhost:3000/activate/${token}">` +
  //   `here</a> to activate your account.</p>`,
  // };
  // Em desenvolvimento, apenas logar
  // console.log('Sending activation email to:', email, 'with token:', token);
  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) console.log(error);
  //   else console.log('Email sent:', info.response);
  // });
}

function sendPasswordResetEmail(email, token) {
  // const mailOptions = {
  //   from: 'noreply@authapp.com',
  //   to: email,
  //   subject: 'Reset your password',
  //   html: `<p>Click <a href="http://localhost:3000/reset/${token}">` +
  //   `here</a> to reset your password.</p>`,
  // };
  // console.log('Sending reset email to:', email, 'with token:', token);
}

function sendEmailChangeNotification(oldEmail, newEmail) {
  // const mailOptions = {
  //   from: 'noreply@authapp.com',
  //   to: oldEmail,
  //   subject: 'Email change notification',
  //   html: `<p>Your email has been changed to ${newEmail}.</p>`,
  // };
  // console.log('Sending email change notification to:', oldEmail);
}

module.exports = {
  sendActivationEmail,
  sendPasswordResetEmail,
  sendEmailChangeNotification,
};

'use strict';

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const { CLIENT_HOST, SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD }
  = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  prot: SMTP_PORT,
  auth: {
    user: SMTP_USERNAME,
    pass: SMTP_PASSWORD,
  },
});

function send({ email, subject, html }) {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

function sendResetLink(email, token) {
  const href = `${CLIENT_HOST}/reset/${token}`;

  const html = `
  <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
    }

    h1 {
      color: #333;
    }

    p {
      margin-bottom: 20px;
    }

    a {
      background-color: #4caf50;
      color: #fff;
      text-decoration: none;
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
</head>

<body>
  <h1>Password Reset</h1>
  <p>Dear User,</p>
  <p>
    We received a request to reset your password.
    Please click the button below to proceed:
  </p>

  <a href="${href}">Reset Password</a>

  <p>If you didn't request a password reset, please ignore this email.</p>
  <p>Thank you!</p>
</body>

</html>
`;

  return send({
    email,
    html,
    subject: 'Reset your password',
  });
}

function sendConfirmationEmail(name, email, token) {
  const href = `${CLIENT_HOST}/confirmation/${token}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Confirmation</title>
    </head>
    <body
      style="font-family: Arial, sans-serif; padding: 20px; text-align: center;"
    >

      <h1>Hello ${name}!</h1>
      <p>Thank you for choosing to confirm your email address.</p>
      <p>Please click the following link to complete the confirmation:</p>

      <a
        href="${href}"
        style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #007BFF;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;"
      >
        Confirm Email
      </a>

      <p>If you didn't request this confirmation, you can ignore this email.</p>

      <p>Best regards,<br>Your Application Team</p>

    </body>
    </html>
  `;

  return send({
    email,
    html,
    subject: 'Confirm Changing your email',
  });
}

function sendActivationEmail(name, email, token) {
  const href = `${CLIENT_HOST}/activation/${token}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f4f4f4;
          text-align: center;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #333;
        }
        h2 {
          color: #555;
        }
        a {
          display: inline-block;
          margin-top: 15px;
          padding: 10px 20px;
          background-color: #007bff;
          color: #fff;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Activate Account</h1>
        <h2>Hey ${name}!</h2>
        <p>
          Your account activation link is below. Click to activate your account:
        </p>
        <a href="${href}" target="_blank">${href}</a>
      </div>
    </body>
    </html>
  `;

  return send({
    email,
    html,
    subject: 'Activate Your Account',
  });
}

function sendNotifyOldEmail(name, email) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Change Notification</title>
    </head>
    <body
      style="
        font-family: Arial, sans-serif;
        padding: 20px;
        text-align: center;
      "
    >

      <h1>Hello ${name}!</h1>
      <p>This is a notification that your account email has been changed.</p>
      <p>If you made this change, you can disregard this email.</p>
      <p>
        If you didn't make this change,
          please contact our support team immediately.
      </p>

      <p>Best regards,<br>Your Application Team</p>

    </body>
    </html>
  `;

  return send({
    email,
    html,
    subject: 'Your account email has been changed!',
  });
}

module.exports = {
  send,
  sendActivationEmail,
  sendResetLink,
  sendConfirmationEmail,
  sendNotifyOldEmail,
};

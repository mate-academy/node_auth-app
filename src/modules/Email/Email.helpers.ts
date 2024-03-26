export function getActivationEmail(activationLink: string) {
  return `
  <!DOCTYPE html>
<html>

<head>
  <title>Account Activation</title>
  <style>
    .email-container {
      text-align: center;
      padding: 20px;
    }

    .email-content {
      margin: auto;
      max-width: 600px;
      background: #f7f7f7;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .button {
      display: inline-block;
      padding: 10px 20px;
      margin: 20px 0;
      background-color: #007bff;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
    }
  </style>
</head>

<body>
  <div class="email-container">
    <div class="email-content">
      <h1>Activate Your Account</h1>
      <p>Hello, and thank you for registering. Please click the link below to activate your account.</p>
      <a href="${activationLink}" class="button" style="color: white;" target="_blank">Activate Account</a>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  </div>
</body>

</html>`;
}

export function getPasswordResetEmail(resetLink: string) {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 7px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin: 20px 0;
            color: #ffffff;
            background-color: #007bff;
            border-radius: 5px;
            text-decoration: none;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 0.8em;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Password Reset Request</h2>
        <p>Dear User,</p>
        <p>You recently requested to reset your password for your account. Please click on the button below to reset it:</p>
        <a href="${resetLink}" class="button">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
        <p>Thank you,</p>
        <p>The Support Team</p>
        <div class="footer">
            <p>This is an automated message, please do not reply directly to this email.</p>
        </div>
    </div>
</body>
</html>
`;
}

export function getPasswordChangedEmail() {
  return `
  <!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 7px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
        }
        .footer {
            text-align: center;
            font-size: 0.8em;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Password Change Notification</h2>
        <p>Dear User,</p>
        <p>Your account password has been successfully changed. If you did not initiate this change, please contact our support team immediately.</p>
        <a href="${process.env.SUPPORT_URL ?? ''}" class="button">Contact Support</a>
        <p>For your security, please do not share your password with others.</p>
        <p>Thank you,<br>Your Website Team</p>
        <div class="footer">
            &copy; 2024 Your Website. All rights reserved.
        </div>
    </div>
</body>
</html>
`;
}

export function getUpdateEmailLetterForOldEmail(code: string, newEmail: string) {
  return `<!DOCTYPE html>
  <html>
  <head>
      <style>
          .email-container {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              text-align: center;
          }
          .header {
              font-size: 20px;
              color: #333;
              margin-bottom: 20px;
          }
          .content {
              font-size: 16px;
              color: #666;
              margin-bottom: 20px;
          }
          .code {
              font-size: 24px;
              color: #000;
              font-weight: bold;
              margin-bottom: 20px;
          }
      </style>
  </head>
  <body>
      <div class="email-container">
          <div class="header">Email Change Request</div>
          <div class="content">A request has been made to change the email associated with your account to <strong>${newEmail}</strong>.</div>
          <div class="content">Please use the following verification code to confirm the change:</div>
          <div class="code">${code}</div>
          <div class="content">If you did not request this change, please ignore this email or contact support.</div>
      </div>
  </body>
  </html>
  `;
}

export function getUpdateEmailLetterForNewEmail(code: string) {
  return `<!DOCTYPE html>
  <html>
  <head>
      <style>
          .email-container {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              text-align: center;
          }
          .header {
              font-size: 20px;
              color: #333;
              margin-bottom: 20px;
          }
          .content {
              font-size: 16px;
              color: #666;
              margin-bottom: 20px;
          }
          .code {
              font-size: 24px;
              color: #000;
              font-weight: bold;
              margin-bottom: 20px;
          }
      </style>
  </head>
  <body>
      <div class="email-container">
          <div class="header">Email Verification Required</div>
          <div class="content">Welcome to your new email setup. Please use the following verification code to complete the email change process:</div>
          <div class="code">${code}</div>
          <div class="content">Thank you for updating your account. If you have any issues, please contact support.</div>
      </div>
  </body>
  </html>
  `;
}

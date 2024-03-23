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

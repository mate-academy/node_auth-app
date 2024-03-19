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

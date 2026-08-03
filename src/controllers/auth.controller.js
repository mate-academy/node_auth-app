const authService = require('../services/auth.service.js');

async function registration(req, res) {
  const { name, email, password } = req.body;
  const userData = {
    name,
    email,
    password,
  };

  try {
    await authService.registration(userData);

    res.status(201).send({
      message:
        'Your account has been created successfully. ' +
        'Please check your email and activate your account before logging in.',
    });
  } catch (error) {
    res.status(409).send({ message: error.message });
  }
}

async function activate(req, res) {
  const { email, token } = req.params;
  const activationData = {
    email,
    token,
  };

  try {
    await authService.activate(activationData);

    res.status(200).send({
      message: 'Activation completed successfully',
    });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  const loginData = {
    email,
    password,
  };

  try {
    const user = await authService.login(loginData);

    res.cookie('accessToken', user.accessToken, { httpOnly: true });

    const normalizedUser = authService.normalize(user);

    res.status(200).send(normalizedUser);
  } catch (error) {
    res.status(401).send({ message: error.message });
  }
}

async function profile(req, res) {
  res.status(200).send(authService.normalize(req.user));
}

async function logout(req, res) {
  await authService.logout(req.user.id);

  res.clearCookie('accessToken');

  res.status(200).send({
    message: 'Logout completed successfully',
  });
}

async function resetPasswordRequest(req, res) {
  const { email } = req.body;

  try {
    await authService.requestPasswordReset(email);

    res.status(200).send({
      message:
        'If an account with this email exists, ' +
        'a password reset email has been sent.',
    });
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
}

async function validateResetPasswordToken(req, res) {
  const { email, resetPasswordToken } = req.params;

  try {
    await authService.validateResetPasswordToken(email, resetPasswordToken);

    res.status(200).send({ message: 'Password reset link is valid.' });
  } catch (error) {
    res
      .status(400)
      .send({ message: 'Invalid or expired password reset link.' });
  }
}

async function resetPassword(req, res) {
  const { email, resetPasswordToken, newPassword, confirmation } = req.body;
  const resetData = {
    email,
    resetPasswordToken,
    newPassword,
    confirmation,
  };

  try {
    await authService.resetPassword(resetData);

    res.status(200).send({ message: 'Password reset successful' });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}

async function nameChange(req, res) {
  const { id } = req.user;
  const { newName } = req.body;
  const userData = {
    id,
    newName,
  };

  try {
    await authService.nameChange(userData);

    res.status(200).send({ message: 'Name successfully changed.' });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}

async function passwordChange(req, res) {
  const user = req.user;
  const { oldPassword, newPassword, confirmation } = req.body;
  const userData = {
    user,
    oldPassword,
    newPassword,
    confirmation,
  };

  try {
    await authService.passwordChange(userData);

    res.status(200).send({ message: 'Password successfully changed.' });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}

async function emailChange(req, res) {
  const user = req.user;
  const { password, pendingEmail } = req.body;
  const changeData = {
    user,
    password,
    pendingEmail,
  };

  try {
    await authService.emailChange(changeData);

    res.status(200).send('Please confirm your new email address.');
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}

async function confirmEmailChange(req, res) {
  const { pendingEmail, emailChangeToken } = req.params;
  const confirmData = {
    pendingEmail,
    emailChangeToken,
  };

  try {
    await authService.confirmEmailChange(confirmData);

    res.status(200).send({ message: 'Email successfully changed.' });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}

module.exports = {
  registration,
  activate,
  login,
  profile,
  logout,
  resetPasswordRequest,
  validateResetPasswordToken,
  resetPassword,
  nameChange,
  passwordChange,
  emailChange,
  confirmEmailChange,
};

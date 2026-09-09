import { passwordService } from '../services/password.service.js';

const reset = async (req, res) => {
  const { email } = req.body;

  await passwordService.emailPasswordReset({ email });

  res.send({
    message:
      'If this email is registered, a password reset link has been sent.',
  });
};

const confirmReset = async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmation } = req.body;

  await passwordService.confirmPasswordReset(
    resetToken,
    password,
    confirmation,
  );

  res.send({
    message: 'Password successfully changed',
  });
};

export const passwordController = {
  reset,
  confirmReset,
};

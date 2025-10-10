import { ApiError } from '../../exeptions/api.error.js';
import { userService } from '../../services/user.service.js';

export const resetRequest = async (req, res) => {
  const { email } = req.body;

  await userService.createPasswordResetToken(email);

  res.json({ message: 'Якщо акаунт існує, інструкції надіслані на email' });
};

export const resetPassword = async (req, res) => {
  try {
    const { password, confirmation } = req.body;
    const { token } = req.params;

    if (!password || !confirmation) {
      throw ApiError.badRequest('Password and confirmation are required');
    }

    if (password !== confirmation) {
      throw ApiError.badRequest('Passwords do not match');
    }

    const result = await userService.resetPasswordService(token, password);

    res.status(200).json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      res
        .status(err.status || 400)
        .json({ message: err.message, errors: err.errors || null });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

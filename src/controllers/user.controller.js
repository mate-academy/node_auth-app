const { userService } = require('../services/user.service');
const { passwordService } = require('../services/password.service');
const { ApiError } = require('../exeptions/api.error');
const { validatePassword } = require('../utils/validators');

const updateName = async (req, res) => {
  const { newName } = req.body;

  const updatedUser = await userService.updateUserName(req.user.id, newName);

  const normalizedUser = userService.normalizeUser(updatedUser);

  res.send(normalizedUser);
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest('Passwords do not match', {
      confirmPassword: 'Passwords do not match',
    });
  }

  const passwordError = validatePassword(newPassword);

  if (passwordError) {
    throw ApiError.badRequest('Invalid new password', {
      password: passwordError,
    });
  }

  await passwordService.updateProfilePassword(
    req.user.id,
    oldPassword,
    newPassword,
  );

  res.send({ message: 'Successfully updated password' });
};

const userController = {
  updateName,
  updatePassword,
};

module.exports = { userController };

const { asyncHandler } = require('../utils/asyncHandler');
const { usersServices } = require('../services/users.services');
const { userDto } = require('../dto/user.dto');
const { ApiError } = require('../exeptions/auth.error');
const { checkUserPassword } = require('../utils/users/checkUserPassword');
const { nameSchema } = require('../utils/validation/name');
const { sendEmailNotify } = require('../services/email.services');
const { emailSchema } = require('../utils/validation/email');

const getUsers = async (_, res) => {
  const users = await usersServices.getUsers();

  const usersDto = users.map((user) => userDto(user));

  res.status(200).json(usersDto);
};

const updateUser = async (req, res) => {
  const { id } = req.params;

  const user = await usersServices.getUsersById(id);

  if (!user) {
    throw ApiError.badRequest("The user doesn't exist");
  }

  const { name, email, newPassword, confirmedPassword, oldPassword } = req.body;

  if (oldPassword) {
    await checkUserPassword(
      oldPassword,
      user.password,
      newPassword,
      confirmedPassword,
    );
  }

  if (newPassword && confirmedPassword) {
    if (newPassword !== confirmedPassword) {
      throw ApiError.badRequest(
        'New password and confirmed password must match.',
      );
    }
  }

  if (name) {
    await nameSchema.validate({ name });
  }

  if (email) {
    if (email === user.email) {
      throw ApiError.badRequest(
        'The new email address must be different from the old one.',
      );
    }
    await emailSchema.validate({ email });

    sendEmailNotify(user.email, email);
  }

  const updatedUser = await usersServices.updateUser(user, {
    name,
    password: newPassword,
    email,
  });

  res.status(200).json(userDto(updatedUser));
};

module.exports = {
  usersControllers: {
    getUsers: asyncHandler(getUsers),
    updateUser: asyncHandler(updateUser),
  },
};

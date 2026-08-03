const { userServices } = require('../services/userServices.js');
const { User } = require('../models/userModel.js');
const { ApiError } = require('../exeptions/apiError.js');
const bycrpt = require('bcrypt');
const { emailServices } = require('../services/emailServices.js');

const getMe = (request, response) => {
  const { id } = request.params;
  const currentUser = request.user;

  if (!currentUser) {
    response.sendStatus(401);

    return;
  }

  if (currentUser.id !== Number(id)) {
    throw ApiError.unauthorized({ unauthorized: 'unauthorized user' });
  }

  const normalizedUser = userServices.normalized(currentUser);

  return response.send(normalizedUser);
};

const updateName = async (request, response) => {
  const id = Number(request.params.id);
  const { name, password, newPassword, confirmation, newEmail } = request.body;
  const currentUser = request.user;

  if (!currentUser) {
    response.sendStatus(401);
  }

  if (currentUser.id !== Number(id)) {
    throw ApiError.unauthorized({ unauthorized: 'unauthorized user' });
  }

  const user = await User.findOne({ where: { id } });

  if (!user) {
    throw ApiError.notFound();
  }

  if (name !== undefined) {
    if (name.trim() === '') {
      throw ApiError.badRequest('Provide a valid name', {
        name: 'Name cannot be empty',
      });
    }
    user.name = name;
  }

  if (
    password !== undefined &&
    newPassword !== undefined &&
    confirmation !== undefined
  ) {
    if (
      password.trim() === '' ||
      newPassword.trim() === '' ||
      confirmation.trim() === ''
    ) {
      throw ApiError.badRequest('Do not submit the form blank', {
        blank: 'Do not submit the form blank',
      });
    }

    const isPasswordValid = bycrpt.compare(password, user.password);

    if (!isPasswordValid) {
      throw ApiError.badRequest('Incorrect password', {
        password: 'Incorrect password',
      });
    }

    if (newPassword !== confirmation) {
      throw ApiError.badRequest('Incorrect confirmation', {
        confirmation: 'Incorrect confirmation',
      });
    }

    const hashedPass = await bycrpt.hash(password, 10);

    user.password = hashedPass;
  }

  if (password !== undefined && newEmail !== undefined) {
    if (password.trim() === '') {
      throw ApiError.badRequest('Enter your password', {
        newEmail: 'Enter your password',
      });
    }

    if (newEmail.trim() === '') {
      throw ApiError.badRequest('You need the new email.', {
        newEmail: 'You need the new email.',
      });
    }

    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      throw ApiError.badRequest('Invalid email format', {
        newEmail: 'Invalid email format',
      });
    }

    const isPasswordValid = bycrpt.compare(password, user.password);

    if (!isPasswordValid) {
      throw ApiError.badRequest('Incorrect password', {
        password: 'Incorrect password',
      });
    }

    const existUser = await userServices.findByEmail(newEmail);

    if (existUser) {
      throw ApiError.badRequest('This email is already registered', {
        newEmail: 'This email is already registered.',
      });
    }

    emailServices.sendNotification(user.email);
    user.email = newEmail;
  }

  await user.save();

  const normalizedUser = userServices.normalized(user);

  return response.status(200).send(normalizedUser);
};

const userController = {
  getMe,
  updateName,
};

module.exports = {
  userController,
};

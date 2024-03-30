const { ApiError } = require('../exceptions/ApiError.js');
const { jwtService } = require('../services/jwtService.js');
const { userService } = require('../services/userService.js');
const { validate } = require('../utils/validate.js');

async function getAll(req, res, next) {
  const users = await userService.getAllActive();

  res.send(users.map(userService.normalize));
}

async function changeName(req, res, next) {
  const { name } = req.body;

  const errors = {
    name: validate.name(name),
  };

  if (errors.name) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const userData = await getUserData(req);

  await userService.changeName(userData.email, name);

  res.sendStatus(200);
}

async function changePassword(req, res, next) {
  const { oldPass, newPass, confirmation } = req.body;
  const userData = await getUserData(req);

  await userService.changePassword(
    userData.email,
    oldPass,
    newPass,
    confirmation,
  );

  res.sendStatus(200);
}

async function changeEmailRequest(req, res, next) {
  const { newEmail, password } = req.body;

  const errors = {
    email: validate.email(newEmail),
  };

  if (errors.email) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const userData = await getUserData(req);

  await userService.changeEmailRequest(userData.email, password, newEmail);

  res.sendStatus(200);
}

async function changeEmail(req, res, next) {
  const { activationToken } = req.params;
  const { newEmail } = req.body;

  await userService.changeEmail(activationToken, newEmail);

  res.sendStatus(200);
}

async function getUserData(req) {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  return userData;
}

module.exports = {
  userController: {
    getAll,
    changeName,
    changePassword,
    changeEmailRequest,
    changeEmail,
  },
};

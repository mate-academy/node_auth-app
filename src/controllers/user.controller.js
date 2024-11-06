const ApiError = require('../exceptions/api.error.js');
const userService = require('../services/user.service.js');
const authService = require('../services/auth.service.js');
const bcrypt = require('bcrypt');

async function getAllActivated(req, res) {
  const users = await userService
    .getAllActivated()
    .then((activatedUsers) => activatedUsers.map(userService.normalize));

  res.send(users);
}

async function getOne(req, res) {
  const { userId } = req.params;
  const user = await userService.getOne(userId);

  const errors = {
    user:
      (user.activationToken ? 'user is not activated' : undefined) ||
      (!user ? 'user not found' : undefined),
  };

  if (errors.user) {
    throw ApiError.notFound(errors);
  }

  res.send(userService.normalize(user));
}

async function update(req, res) {
  const { userId } = req.params;
  const { name, password, newPwd, confirmNewPwd, email } = req.body;
  const user = await userService.getOne(userId);

  if (email || (newPwd && confirmNewPwd)) {
    const isPwdCorrect = await bcrypt.compare(password, user.password);

    if (!isPwdCorrect) {
      throw ApiError.badRequest('Auth failed', {
        password: 'Incorrect password',
      });
    }

    const errors = {
      password:
        authService.validatePassword(newPwd) ||
        (newPwd !== confirmNewPwd ? 'Passwords do not match' : undefined),
    };

    if (errors.password) {
      throw ApiError.badRequest('Bad request', errors);
    }
  }

  await userService.update(userId, name, newPwd, email);

  const updatedUser = await userService
    .getOne(userId)
    .then(userService.normalize);

  res.send(updatedUser);
}

module.exports = {
  getAllActivated,
  getOne,
  update,
};

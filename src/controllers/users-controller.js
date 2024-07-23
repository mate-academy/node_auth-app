const bcrypt = require('bcrypt');
const {
  getAllActiveUsers,
  updateUserEmail,
  updateUserName,
} = require('../services/users-service.js');
const {
  verifyAccessToken,
  verifyRefreshToken,
} = require('../services/jwt-service.js');
const { ApiError } = require('../exceptions/API-error.js');
const { parseAccessToken } = require('../utils/parseAccessToken.js');
const { tokenService } = require('../services/token-service.js');
const { validateEmail, validatePassword } = require('../utils/validation.js');
const {
  findActivatedUserById,
  updatePassword,
} = require('../services/auth-service.js');
const { sendEmailChangeConfirmation } = require('../services/mail-service.js');

const usersController = {
  async getAll(req, res) {
    const activeUsers = await getAllActiveUsers();

    res.send(activeUsers);
  },

  async getProfile(req, res) {
    const auth = req.headers.authorization;

    const accessToken = parseAccessToken(auth);

    const tokenData = verifyAccessToken(accessToken);

    if (!tokenData) {
      throw ApiError.Unauthorized();
    }

    res.send({
      id: tokenData.id,
      name: tokenData.name,
      email: tokenData.email,
    });
  },

  async updateName(req, res) {
    const { name } = req.body;
    const { refreshToken } = req.cookies;

    if (!name?.length) {
      throw ApiError.BadRequest('Incorrect data', { name: 'Name is required' });
    }

    const token = verifyRefreshToken(refreshToken);

    if (!token) {
      throw ApiError.Unauthorized();
    }

    const tokenFromDB = await tokenService.getByToken(refreshToken);

    if (!tokenFromDB) {
      throw ApiError.Unauthorized();
    }

    await updateUserName(tokenFromDB.userId);

    res.sendStatus(200);
  },

  async updatePassword(req, res) {
    const { password, confirmation, newPassword } = req.body;
    const { refreshToken } = req.cookies;

    if (password !== confirmation) {
      throw ApiError.BadRequest('Incorrect data', {
        confirmation: 'Passwords are not the same',
      });
    }

    const passwordErrors = validatePassword(password);
    const confirmationErrors = validatePassword(confirmation);
    const newPasswordErrors = validatePassword(newPassword);

    if (passwordErrors || confirmationErrors || newPasswordErrors) {
      throw ApiError.BadRequest('Incorrect data', {
        password: passwordErrors,
        confirmation: confirmationErrors,
        newPassword: newPasswordErrors,
      });
    }

    const tokenData = verifyRefreshToken(refreshToken);

    if (!tokenData) {
      throw ApiError.Unauthorized();
    }

    const tokenFromDB = await tokenService.getByToken(refreshToken);

    if (!tokenFromDB) {
      throw ApiError.Unauthorized();
    }

    await updatePassword(tokenFromDB.userId, newPassword);

    res.sendStatus(200);
  },

  async updateEmail(req, res) {
    const { password, email } = req.body;
    const { refreshToken } = req.cookies;

    const passwordErrors = validatePassword(password);
    const emailErrors = validateEmail(email);

    if (passwordErrors || emailErrors) {
      throw ApiError.BadRequest('Incorrect data', {
        password: passwordErrors,
        email: emailErrors,
      });
    }

    const tokenData = verifyRefreshToken(refreshToken);

    if (!tokenData) {
      throw ApiError.Unauthorized();
    }

    const user = await findActivatedUserById(tokenData.userId);
    const oldEmail = user.email;

    const tokenFromDB = await tokenService.getByToken(refreshToken);

    if (!tokenFromDB) {
      throw ApiError.Unauthorized();
    }

    await updateUserEmail(email, user.id);

    await sendEmailChangeConfirmation(oldEmail);

    res.sendStatus(200);
  },
};

const compareUserPasswords = (user, plainPassword) => {
  return bcrypt.compare(plainPassword, user.password);
};

module.exports = {
  usersController,
  compareUserPasswords,
};

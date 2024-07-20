const { User } = require('../models/user');
const { usersService } = require('../services/users.service');
const { jwtService } = require('../services/jwt.service');
const { validate } = require('../utils/validation');
const { ApiError } = require('../exeptions/api.error');
const bcrypt = require('bcrypt');
const { tokenService } = require('../services/token.service');

class AuthController {
  register = async (req, res) => {
    const { name, email, password } = req.body;

    const errors = {
      email: validate.email(email),
      password: validate.password(password),
    };

    if (errors.email || errors.password) {
      throw ApiError.badRequest('Bad request', errors);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await usersService.register(name, email, hashedPassword);

    res.send({ message: 'Ok' });
  };
  activate = async (req, res) => {
    const { activationToken } = req.params;
    const user = await User.findOne({ where: { activationToken } });

    if (!user) {
      throw ApiError.badRequest('No such user');
    }

    user.activationToken = null;
    await user.save();

    res.send(user);
  };
  login = async (req, res) => {
    const { email, password } = req.body;

    const user = await usersService.findByEmail(email);

    if (!user) {
      throw ApiError.badRequest('No such user');
    }

    const isPasswordValid = bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      throw ApiError.badRequest('Wrond password');
    }

    this.generateTokens(res, user);
  };
  refresh = async (req, res) => {
    const { refreshToken } = req.cookie;

    const userData = jwtService.verifyRefresh(refreshToken);
    const token = await tokenService.getByToken(refreshToken);

    if (!userData || !token) {
      throw ApiError.unauthorized();
    }

    const user = await usersService.findByEmail(userData.email);

    this.generateTokens(res, user);
  };
  generateTokens = async (res, user) => {
    const normalizedUser = usersService.normalize(user);
    const accessToken = jwtService.sign(normalizedUser);
    const refreshToken = jwtService.signRefresh(normalizedUser);

    await tokenService.save(normalizedUser.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    res.send({ user: normalizedUser, accessToken });
  };
  logout = async (req, res) => {
    const { refreshToken } = req.cookie;
    const userData = jwtService.verifyRefresh(refreshToken);

    if (!userData || !refreshToken) {
      throw ApiError.unauthorized();
    }

    await tokenService.remove(userData.id);

    res.sendStatus(204);
  };
}

const authController = new AuthController();

module.exports = { authController };

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const passport = require('passport');

const { ApiError } = require('../exceptions/ApiError');
const usersService = require('../services/users');
const tokenService = require('../services/token');
const jwtService = require('../services/jwt');
const emailService = require('../services/email');

function validateUsername(value) {
  if (!value) {
    return 'Username is required';
  }
}

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

async function register(req, res, next) {
  const salt = crypto.randomBytes(16).toString('hex');

  const {
    username,
    email,
    password,
  } = req.body;

  const errors = {
    username: validateUsername(username),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.username || errors.email || errors.password) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const existedUser = await usersService.getOneByField({ email });

  if (existedUser) {
    throw ApiError.BadRequest('User with such email is already exists', {
      email: 'User with such email is already exists',
    });
  }

  crypto.pbkdf2(
    password,
    salt,
    310000,
    32,
    'sha256',
    (err, hashedPassword) => {
      if (err) {
        throw ApiError.UnexpectedError();
      }

      const activationToken = uuidv4();

      usersService
        .create({
          username,
          hashed_password: hashedPassword.toString('hex'),
          salt,
          email,
          activationToken,
        })
        .then((user) => {
          emailService.sendActivationLink(email, activationToken);
          res.send({ user: usersService.normalize(user) });
        })
        .catch(error => {
          throw ApiError.UnexpectedError(error);
        });
    },
  );
}

async function activate(req, res, next) {
  const { activationToken } = req.params;

  const user = await usersService.getOneByField({ activationToken });

  if (!user) {
    throw ApiError.BadRequest(
      'Incorrect activation token or account is already activated'
    );
  }

  user.activationToken = null;

  await user.save();

  await sendAuthentication(res, user);
}

async function login(req, res, next) {
  const { email, password } = req.body;

  if (!email) {
    throw ApiError.DataError('Email is required', {
      email: 'Email is required',
    });
  }

  if (!password) {
    throw ApiError.DataError('Password is required', {
      password: 'Password is required',
    });
  }

  return passport.authenticate('local', (err, passportUser, info) => {
    if (err) {
      return next(err);
    }

    if (passportUser) {
      return sendAuthentication(res, passportUser.dataValues);
    }

    next(ApiError.BadRequest(info.message, info.errors));
  })(req, res, next);
}

async function refresh(req, res, next) {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  const token = await tokenService.getByToken(refreshToken);

  if (!token) {
    throw ApiError.Unauthorized();
  }

  const user = await usersService.getOneByField({ email: userData.email });

  await sendAuthentication(res, user);
}

async function logout(req, res, next) {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  res.clearCookie('refreshToken');

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.sendStatus(204);
}

async function sendAuthentication(res, user) {
  const userData = usersService.normalize(user);
  const accessToken = jwtService.generateAccessToken(userData);
  const refreshToken = jwtService.generateRefreshToken(userData);

  await tokenService.save(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    user: userData,
    accessToken,
  });
}

module.exports = {
  register,
  activate,
  login,
  logout,
  refresh,
};

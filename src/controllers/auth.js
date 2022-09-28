const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const passport = require('passport');

const { ApiError } = require('../exceptions/ApiError');
const usersService = require('../services/users');
const tokenService = require('../services/token');
const jwtService = require('../services/jwt');
const emailService = require('../services/email');
const {
  validateUsername,
  validateEmail,
  validatePassword,
  validateEmailChange,
  validateUserPassword,
} = require('../utils/authValidators');

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

async function patch(req, res, next) {
  const userId = req.params.userId;
  const user = await usersService.getById(userId);

  const {
    username,
    email,
    password,
    passwordNew,
  } = req.body;

  const emailNew = email !== user.email;
  const needPasswordCheck = password || passwordNew || emailNew;

  const errors = {
    username: validateUsername(username),
    email: await validateEmailChange(email, userId),
    password: needPasswordCheck && validateUserPassword(password, user),
    passwordNew: passwordNew !== '' && validatePassword(passwordNew),
  };

  if (
    errors.username
      || errors.email
      || errors.password
      || errors.passwordNew
  ) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  try {
    const hashedPassword = passwordNew
      ? crypto
        .pbkdf2Sync(passwordNew, user.salt, 310000, 32, 'sha256')
        .toString('hex')
      : user.hashed_password;

    const activationToken = emailNew ? uuidv4() : null;

    const userData = {
      username,
      hashed_password: hashedPassword,
      salt: user.salt,
      email,
      activationToken,
      resetToken: null,
    };

    usersService
      .patchById(userId, userData)
      .then(() => {
        if (emailNew) {
          emailService.sendEmailChanged(email, user.email);
          emailService.sendActivationLink(email, activationToken);
        }

        tokenService.remove(userId);

        res.send(
          { user: usersService.normalize(
            {
              ...userData,
              id: userId,
            }
          ),
          accessToken: null }
        );
      })
      .catch(error => {
        throw ApiError.UnexpectedError(error);
      });
  } catch (error) {
    throw ApiError.UnexpectedError(error);
  }
}

async function remove(req, res, next) {
  const userId = req.params.userId;
  const user = await usersService.getById(userId);

  const {
    password,
  } = req.body;

  const errors = {
    password: validateUserPassword(password, user),
  };

  if (errors.password) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  try {
    usersService
      .removeById(userId)
      .then(() => {
        tokenService.remove(userId);
        emailService.sendAccountRemoved(user.email);

        res.send({ user: null, accessToken: null });
      })
      .catch(error => {
        throw ApiError.UnexpectedError(error);
      });
  } catch (error) {
    throw ApiError.UnexpectedError(error);
  }
}

async function reset(req, res, next) {
  const {
    email,
  } = req.body;

  const errors = {
    email: validateEmail(email),
  };

  if (errors.email) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const user = await usersService.getOneByField({ email });

  if (!user) {
    throw ApiError.BadRequest('User not found');
  }

  if (user.resetToken) {
    if (jwtService.validateResetToken(user.resetToken)) {
      throw ApiError.BadRequest(
        'Request token has been already sent to your email'
      );
    }
  }

  try {
    const userData = usersService.normalize(user);
    const resetToken = jwtService.generateResetToken(userData);

    user.resetToken = resetToken;

    user.save();

    emailService.sendResetLink(email, resetToken);

    res.sendStatus(200);
  } catch (error) {
    throw ApiError.UnexpectedError(error);
  }
}

async function setPassword(req, res, next) {
  const {
    password,
    resetToken,
  } = req.body;

  if (!resetToken) {
    throw ApiError.BadRequest('Reset token is required');
  }

  const errors = {
    password: validatePassword(password),
  };

  if (errors.password) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const user = await usersService.getOneByField({ resetToken });

  if (!user) {
    throw ApiError.BadRequest('User not found or token has expired');
  }

  try {
    const hashedPassword = crypto
      .pbkdf2Sync(password, user.salt, 310000, 32, 'sha256')
      .toString('hex');

    const userData = {
      username: user.username,
      hashed_password: hashedPassword,
      salt: user.salt,
      email: user.email,
      activationToken: null,
      resetToken: null,
    };

    usersService
      .patchById(user.id, userData)
      .then(async(patchedUser) => {
        await sendAuthentication(res, {
          ...userData,
          id: user.id,
        });
      })
      .catch(error => {
        throw ApiError.UnexpectedError(error);
      });
  } catch (error) {
    throw ApiError.UnexpectedError(error);
  }
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
  patch,
  remove,
  reset,
  setPassword,
};

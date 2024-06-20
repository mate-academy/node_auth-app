const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');
const CustomStrategy = require('passport-custom').Strategy;
const { uuid } = require('uuidv4');
const bcrypt = require('bcrypt');

const {
  userNormalize,
  findUserByToken,
  findUserByMail,
  createUser,
  createUserWithoutToken,
} = require('../models/user.model/user.model');
const {
  sendActivationMail,
  sendPasswordReminderEmail,
} = require('../services/email.service');
const { verifyRefresh, generateTokens } = require('../services/jwt.service');
const {
  validateName,
  validateEmail,
  validatePassword,
} = require('../helpers/validateProps');
const tokenService = require('../models/token.model/token.model');
const { response } = require('../constants/response');
const { COOKIE_OPTIONS, COOKIES } = require('../constants/cookies');
const { GOOGLE_AUTH_OPTIONS } = require('../constants/auth');

passport.use(new Strategy(GOOGLE_AUTH_OPTIONS, verifyGoogleCB));
passport.use('custom', new CustomStrategy(verifyCustomCB));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  done(null, id);
});

async function httpSignupUser(req, res) {
  const { name, email, password } = req.body;

  const errors = [
    validateName(name),
    validateEmail(email),
    validatePassword(password),
  ];

  if (errors.some((error) => !!error)) {
    res.status(response[400].statusCode).json({
      error: true,
      message: errors.filter((error) => !!error).join(' '),
    });
  }

  const user = await findUserByMail(email);

  await sendActivationMail(user.email, user.activationToken);

  res
    .status(response[201].statusCode)
    .json({ error: false, user: userNormalize(user) });
}

async function httpActivateUser(req, res) {
  const { activationToken } = req.params;

  const user = await findUserByToken(activationToken);

  if (!user) {
    res
      .status(response[404].statusCode)
      .json({ error: true, message: response[404].messages.noUser });

    return;
  }

  res.redirect(response[307].statusCode, 'http://localhost:8000');
}

async function httpLoginUser(req, res) {
  const { email, password } = req.body;

  const user = await findUserByMail(email);

  const isValidPassword = bcrypt.compare(password, user.password);

  if (!user || !isValidPassword) {
    res
      .status(response[400].statusCode)
      .json({ error: true, message: response[400].messages.credentials });

    return;
  }

  if (user.accessToken) {
    res
      .status(response[400].statusCode)
      .json({ error: true, message: response[400].messages.verify });

    return;
  }

  const {
    accessToken,
    refreshToken: refresh,
    normalizedUser,
  } = generateTokens(user);

  await tokenService.save(normalizedUser.id, accessToken, refresh);

  res.cookie(COOKIES.login, accessToken, COOKIE_OPTIONS(COOKIES.login));

  res.cookie(COOKIES.refresh, refresh, COOKIE_OPTIONS(COOKIES.refresh));

  res
    .status(response[200].statusCode)
    .json({ error: false, user: normalizedUser });
}

async function httpLogoutUser(req, res, next) {
  req.logOut(req.user, function (err) {
    if (err) {
      return next(err);
    }
  });

  res.status(200).json({ authenticated: false, user: req.user });
}

async function httpRefreshUserToken(req, res) {
  const { refreshToken } = req.cookies;

  const user = verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!user || !token) {
    res
      .status(response[401].statusCode)
      .json({ error: true, message: response[401].messages.unauthorized });
  }

  const {
    accessToken,
    refreshToken: refresh,
    normalizedUser,
  } = generateTokens(user);

  await tokenService.save(normalizedUser.id, accessToken, refresh);

  res.cookie(COOKIES.login, accessToken, COOKIE_OPTIONS(COOKIES.login));

  res.cookie(COOKIES.refresh, refresh, COOKIE_OPTIONS(COOKIES.refresh));

  res
    .status(response[200].statusCode)
    .json({ error: false, user: normalizedUser });
}

async function httpCheckAuthStatus(req, res) {
  if (req.user) {
    const userId = req.cookies['session.sig'];

    res
      .status(response[200].statusCode)
      .json({ authenticated: true, user: userId });

    return;
  }

  res.status(response[401].statusCode).json({ authenticated: false });
}

async function verifyGoogleCB(accessToken, refreshToken, profile, done) {
  const { displayName, emails, id } = profile;

  const user = await findUserByMail(emails[0].value);

  if (!user) {
    const newUser = await createUserWithoutToken({
      name: displayName,
      email: emails[0].value,
      password: id,
    });

    await tokenService.save(newUser.id, accessToken, refreshToken);
  }

  done(null, profile);
}

async function verifyCustomCB(req, done) {
  const { name, email, password } = req.body;

  const hashedPass = await bcrypt.hash(password, 10);
  const activationToken = uuid();

  const user = await findUserByMail(email);

  if (!user) {
    const newUser = await createUser(name, email, hashedPass, activationToken);

    await tokenService.save(newUser.id, activationToken, activationToken);

    done(null, newUser);

    return;
  }

  done(null, user);
}

async function httpUserValidation(req, res) {
  const { email } = req.body;

  const user = await findUserByMail(email);

  if (!user) {
    res
      .status(response[400].statusCode)
      .json({ error: true, message: response[400].messages.credentials });
  }

  const activationToken = uuid();

  user.activationToken = activationToken;

  user.save();

  await sendPasswordReminderEmail(user.email, activationToken);

  res.status(response[202].statusCode).json({
    error: false,
    token: activationToken,
    message: response[202].message.needAction,
  });
}

async function httpRestorePassword(req, res) {
  const { activationToken } = req.params;

  const user = await findUserByToken(activationToken);

  if (!user) {
    res
      .status(response[404].statusCode)
      .json({ error: true, message: response[404].messages.noUser });

    return;
  }

  res.redirect(
    response[307].statusCode,
    `http://localhost:8000/newpassword?email=${user.email}`,
  );
}

async function httpChangePassword(req, res) {
  const { password, email } = req.body;

  const user = await findUserByMail(email);

  const hashedPass = await bcrypt.hash(password, 10);

  user.password = hashedPass;

  user.save();

  res.status(200).json({ error: false, message: 'password has been changed' });
}

module.exports = {
  httpSignupUser,
  httpActivateUser,
  httpLoginUser,
  httpLogoutUser,
  httpRefreshUserToken,
  httpCheckAuthStatus,
  httpUserValidation,
  httpRestorePassword,
  httpChangePassword,
  passport,
};

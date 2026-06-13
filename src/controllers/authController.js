const bcrypt = require('bcrypt');
const { v4: UUIDV4 } = require('uuid');
const userRepository = require('../entity/userRepo.js');
const resetPasswordTokenRepo = require('../entity/resetPasswordTokenRepo.js');
const mailer = require('../utils/nodemailer.js');
const jwt = require('../utils/jwt.js');
const { getToken, hashToken } = require('../utils/resetPasswordToken.js');
const checkData = require('../utils/checkData.js');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: checkData({ field: 'name', data: name }),
    email: checkData({ field: 'email', data: email }),
    password: checkData({ field: 'password', data: password }),
  };

  if (Object.values(errors).some((e) => e)) {
    return res.status(400).json(errors);
  }

  const emailIsTaken = await userRepository.getByEmail(email);

  if (emailIsTaken) {
    return res.status(400).json({ email: 'Email is taken' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const activationToken = UUIDV4();
  const newUser = await userRepository.create({
    name,
    email,
    password: hashedPassword,
    activationToken,
  });

  mailer.sendActivationMail(email, activationToken);

  res.status(201).json({ user: userRepository.normalize(newUser) });
};

const registrationPage = (req, res) => {
  const { accessToken } = req.cookies;
  const isAuthorize = Boolean(jwt.verifyAccessToken(accessToken));

  res.render('registrationPage', { isAuthorize });
};

const loginPage = (req, res) => {
  const { accessToken } = req.cookies;
  const isAuthorize = Boolean(jwt.verifyAccessToken(accessToken));

  res.render('loginPage', { isAuthorize });
};

const actvationPage = (req, res) => {
  const url = req.headers?.referer || process.env.CLIENT_HOST;
  const pathname = new URL(url).pathname.split('/')[2] || null;

  if (!pathname || pathname !== 'register') {
    return res.redirect(process.env.CLIENT_HOST);
  }

  res.render('showMessage', {
    isAuthorize: false,
    message: 'A confirmation code has been dispatched to your email.',
  });
};

const activateUser = async (req, res) => {
  const { activationToken } = req.params;

  try {
    await userRepository.updateUser(
      { activationToken: null },
      { activationToken },
    );
  } catch {
    return res.status(400).send('Invalid activation token');
  }

  res.redirect(process.env.CLIENT_HOST + '/profile');
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const errors = {
    email: checkData({ field: 'email', data: email }),
    password: checkData({ field: 'password', data: password }),
  };

  if (Object.values(errors).some((e) => e)) {
    return res.status(400).json(errors);
  }

  const user = await userRepository.getByEmail(email);
  const isValidPassword = await bcrypt.compare(password, user?.password || '');

  if (!user || !isValidPassword) {
    return res.status(403).send('Invalid email or password');
  }

  const normalizeUser = userRepository.normalize(user);
  const accessToken = jwt.getAccessToken(normalizeUser);

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.send({
    user: normalizeUser,
  });
};

const forgotPasswordPage = (req, res) => {
  const { accessToken } = req.cookies;
  const isAuthorize = Boolean(jwt.verifyAccessToken(accessToken));

  res.render('forgotPasswordPage', { isAuthorize });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const error = checkData({ field: 'email', data: email });

  if (error) {
    return res.status(400).json(error);
  }

  const user = await userRepository.getByEmail(email);

  if (!user) {
    return res.sendStatus(404);
  }

  const resetPasswordToken = getToken();
  const hashedToken = hashToken(resetPasswordToken);

  await mailer.sendResetPasswordMail(user.email, resetPasswordToken);
  await resetPasswordTokenRepo.deletByUserId(user.id);
  await resetPasswordTokenRepo.createToken(hashedToken, user.id);

  res.sendStatus(205);
};

const restPasswordPage = async (req, res) => {
  const { accessToken } = req.cookies;
  const { token } = req.params;
  const isAuthorize = Boolean(jwt.verifyAccessToken(accessToken));
  const hashedToken = hashToken(token);
  const findedToken = await resetPasswordTokenRepo.getToken(hashedToken);

  if (!findedToken) {
    return res.render('showMessage', { isAuthorize, message: 'Invalid token' });
  }

  res.render('resetPasswordPage', { isAuthorize, token });
};

const resetPassword = async (req, res) => {
  const data = req.body;
  const newPassword = data['new-password'];
  const confirmPassword = data['confirm-password'];

  console.log('here');


  const errors = {
    message: 'Wrong fields',
    fields: {
      'new-password': checkData({ field: 'password', data: newPassword }),
      'confirm-password': checkData({
        field: 'password',
        data: confirmPassword,
      }),
    },
  };

  if (Object.values(errors.fields).some((e) => e)) {
    return res.status(400).json(errors);
  } else if (newPassword !== confirmPassword) {
    return res.status(400).json({
      message: 'Passwords must match',
      fields: { 'confirm-password': 'Passwords do not match' },
    });
  }

  const hashedToken = hashToken(data.token || '');
  const findedToken = await resetPasswordTokenRepo.getToken(hashedToken);

  if (!findedToken) {
    return res.status(404).json({ message: 'Token not fund' });
  }

  const passwordIsSame = await bcrypt.compare(
    newPassword,
    findedToken.user.password,
  );

  if (passwordIsSame) {
    return res.status(400).json({
      message: 'New password cannot be the same as the old password',
      fields: { 'new-password': 'Password is same' },
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await userRepository.changePassword(hashedPassword, findedToken.user.id);
  await resetPasswordTokenRepo.deleteToken(hashedToken);

  res.sendStatus(205);
};

module.exports = {
  register,
  registrationPage,
  activateUser,
  actvationPage,
  login,
  loginPage,
  forgotPasswordPage,
  forgotPassword,
  restPasswordPage,
  resetPassword,
};

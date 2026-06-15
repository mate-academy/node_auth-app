const jwt = require('../utils/jwt.js');
const nodemailer = require('../utils/nodemailer.js');
const checkData = require('../utils/checkData.js');
const userRepository = require('../entity/userRepo.js');
const changeEmailTokenRepo = require('../entity/changeEmailTokenRepo.js');
const updateAccessToken = require('../utils/updateAccessToken.js');
const bcrypt = require('bcrypt');
const { v4: UUIDV4 } = require('uuid');

const profilePage = async (req, res) => {
  const { accessToken } = req.cookies;
  const { id } = jwt.verifyAccessToken(accessToken);

  const user = await userRepository.getById(id || '');

  res.render('profilePage', { isAuthorize: Boolean(user), user });
};

const logout = async (req, res) => {
  res.clearCookie('accessToken');
  res.redirect(process.env.CLIENT_HOST + '/auth/login');
};

const changeName = async (req, res) => {
  const { accessToken } = req.cookies;
  const { name } = req.body;

  const invalidName = checkData({ field: 'name', data: name });

  if (invalidName) {
    return res.status(400).json({ message: invalidName });
  }

  const user = jwt.verifyAccessToken(accessToken);

  if (!user) {
    return res.sendStatus(401);
  }

  const updatedUser = await userRepository.updateUser(
    { name },
    { id: user.id },
  );

  const normalizeUser = userRepository.normalize(updatedUser);

  updateAccessToken(res, normalizeUser);

  res.json(normalizeUser);
};

const changePassword = async (req, res) => {
  const data = req.body;
  const { id } = jwt.verifyAccessToken(req.cookies.accessToken || '');
  const user = await userRepository.getById(id);

  if (!user) {
    return res.sendStatus(401);
  }

  const verifyPassword = await bcrypt.compare(data.current, user.password);

  if (!verifyPassword) {
    const response = { message: 'The current password is not correct' };

    return res.status(400).json(response);
  }

  const invalidNewPassword = checkData({ field: 'password', data: data.new });

  if (invalidNewPassword) {
    return res.status(400).json({ message: invalidNewPassword });
  }

  if (data.new !== data.confirm) {
    const response = { message: `the passwords dont match` };

    return res.status(400).json(response);
  }

  const hashadPassword = await bcrypt.hash(data.new, 10);
  const updatedUser = await userRepository.updateUser(
    {
      password: hashadPassword,
    },
    {
      id: user.id,
    },
  );
  const normalizeUser = userRepository.normalize(updatedUser);

  updateAccessToken(res, normalizeUser);

  res.send(normalizeUser);
};

const changeEmail = async (req, res) => {
  const { password, email } = req.body;
  const { id } = jwt.verifyAccessToken(req.cookies.accessToken || '');
  const user = await userRepository.getById(id);

  const errors = {
    email: checkData({ field: 'email', data: email }),
    password: checkData({ field: 'password', data: password }),
  };

  if (Object.values(errors).some((v) => v)) {
    const message = Object.values(errors).join(';');

    return res.status(400).json({ message });
  }

  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  if (!passwordIsCorrect) {
    return res.status(400).json({ message: 'Password is not correct' });
  }

  if (email === user.email) {
    return res.status(400).json({ message: 'The email cannot be the same' });
  }

  const emailExist = await userRepository.getByEmail(email);

  if (emailExist) {
    return res.status(400).json({ message: 'Email is taken' });
  }

  const token = UUIDV4();

  await nodemailer.sendChangeEmailMessage(email, token);
  await changeEmailTokenRepo.create(user.id, email, token);

  res.sendStatus(200);
};

const confirmChangeEmail = async (req, res) => {
  const { token } = req.params;

  let data;

  try {
    data = await changeEmailTokenRepo.remove(token);
  } catch {
    return res.render('showMessage', {
      isAuthorize: true,
      message: 'Invalid token',
    });
  }

  const user = data.user;
  const newEmail = data.newEmail;
  const oldEmail = user.email;

  await userRepository.updateUser({ email: newEmail }, { id: user.id });
  await nodemailer.sendEmailIsChanged(oldEmail, newEmail);

  const messageForPage = `Email changed. <a style="color: #ea8436; text-decoration: none;" href="/profile"> Go to profile </a>`;

  res.render('showMessage', {
    isAuthorize: true,
    message: messageForPage,
  });
};

module.exports = {
  profilePage,
  logout,
  changeName,
  changePassword,
  changeEmail,
  confirmChangeEmail,
};

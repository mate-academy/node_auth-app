const bcrypt = require('bcrypt');

const { ApiError } = require('../exceptions/api.error');
const userService = require('../services/user.service');
const jwtService = require('../services/jwt.service');
const tokenService = require('../services/token.service');
// const emailService = require('../services/email.service');

const sendAuthentication = async (res, user) => {
  const userData = userService.normalize(user);
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
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: userService.validateName(name),
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  await userService.register(name, email, password);

  res.sendStatus(200);
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await userService.findByToken(activationToken);

  if (!user) {
    throw ApiError.NotFound();
  }

  user.activationToken = null;

  await user.save();

  await sendAuthentication(res, user);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.NotFound();
  }

  if (user.activationToken) {
    throw ApiError.BadRequest('User not activated', {
      user: 'User not activated. Please check your email',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Invalid credentials');
  }

  await sendAuthentication(res, user);
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';

  const userData = await jwtService.validateRefreshToken(refreshToken);
  const token = await tokenService.getByToken(refreshToken);
  const user = await userService.findByEmail(userData.email);

  if (!userData || !token || !user || token.userId !== user.id) {
    res.clearCookie('refreshToken');
    throw ApiError.Unauthorized();
  }

  await sendAuthentication(res, user);
};

const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.Unauthorized();
  }

  tokenService.remove(userData.id);

  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

// const reset = async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     throw ApiError.Unauthorized();
//   }

//   await resetPasswordUser(email);
//   res.sendStatus(200);
// };

// const resetPassword = async (req, res) => {
//   const { newPassword, newPasswordConfirmation, resetToken } = req.body;

//   if (!newPassword || !newPasswordConfirmation || !resetToken) {
//     throw ApiError.badRequest('All fields are required.');
//   }

//   if (newPassword.trim() !== newPasswordConfirmation.trim()) {
//     throw ApiError.badRequest('Passwords are not equal');
//   }

//   const token = await findUserByResetToken(resetToken);

//   if (!token || !token.userId) {
//     throw ApiError.badRequest('Invalid or expired reset token');
//   }

//   const user = await findUserById(token.userId);

//   if (!user) {
//     throw ApiError.badRequest('No such user!');
//   }

//   const hashPass = await bcrypt.hash(newPassword, 10);

//   user.password = hashPass;
//   await removeResetToken(token.resetToken);

//   await user.save();

//   res.send('Password reset successfully');
// };

// const resetChecker = async (req, res) => {
//   const { resetToken } = req.params;
//   const userToken = await findUserByResetToken(resetToken);

//   if (!userToken) {
//     throw ApiError.notFound();
//   }

//   const currentTime = moment();

//   if (currentTime.isAfter(userToken.expirationTime)) {
//     throw ApiError.badRequest('Expired reset token');
//   }

//   res.send(userToken);
// };

// const updateUserName = async (req, res) => {
//   const { name, email } = req.body;

//   try {
//     const user = await findByEmail(email);

//     if (!user) {
//       return res.status(404).send({ message: 'User not found' });
//     }

//     user.name = name;
//     await user.save();

//     res.send(normalize(user));
//   } catch (err) {
//     res.status(500).send({ message: 'Internal server error' });
//   }
// };

// const changeAuthPass = async (req, res) => {
//   const { id, email, oldPassword, newPassword, newPasswordConfirmation } =
//     req.body;
//   const user = await findByEmailAndId(id, email);

//   if (!user) {
//     throw ApiError.badRequest('User is not found');
//   }

//   if (newPassword !== newPasswordConfirmation) {
//     throw ApiError.badRequest('Password is not the same');
//   }

//   const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

//   if (!isPasswordValid) {
//     throw ApiError.badRequest('Your current password wrong');
//   }

//   const hashPass = await bcrypt.hash(newPassword, 10);

//   user.password = hashPass;

//   await user.save();

//   await generateTokens(res, user);
// };

// const changeEmail = async (req, res) => {
//   const { user } = req.body;

//   const currentUser = await findUserById(user.id);

//   const findAnotherUserByEmail = await findByEmail(user.email);

//   if (findAnotherUserByEmail) {
//     throw ApiError.badRequest('This email is already exist');
//   }

//   if (!currentUser) {
//     throw ApiError.badRequest('User is not found');
//   }

//   if (currentUser.email === user.email) {
//     throw ApiError.badRequest('Email is the same');
//   }

//   const isPasswordValid = await bcrypt.compare(
//     user.password,
//     currentUser.password,
//   );

//   if (!isPasswordValid) {
//     throw ApiError.badRequest('Your password is wrong');
//   }

//   await sendGoodbyeEmail(currentUser.name, user.email, currentUser.email);

//   currentUser.email = user.email;

//   currentUser.save();

//   await generateTokens(res, currentUser);
// };

module.exports = {
  register,
  activate,
  login,
  refresh,
  logout,
  // reset,
  // resetPassword,
  // resetChecker,
  // updateUserName,
  // changeAuthPass,
  // changeEmail,
};

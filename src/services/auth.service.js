const authRepository = require('../repositories/auth.repository.js');
const bcrypt = require('bcrypt');
const { randomBytes } = require('crypto');
const emailService = require('./email.service.js');

const SALT_ROUNDS = 10;

async function registration(userData) {
  const user = await authRepository.findUserByEmail(userData.email);

  if (user) {
    throw new Error('A user with that email already exists.');
  }

  const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
  const activationToken = randomBytes(32).toString('hex');

  const userToCreate = {
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    activationToken,
  };

  await authRepository.createUser(userToCreate);

  await emailService.sendActivationEmail(
    userToCreate.email,
    userToCreate.name,
    userToCreate.activationToken,
  );
}

async function activate(activationData) {
  const { email, token } = activationData;
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    throw new Error('This user does not exist.');
  }

  if (user.isActive || !user.activationToken) {
    throw new Error(
      'Account is not activated. ' +
        'Please check your email and activate your account.',
    );
  }

  if (token !== user.activationToken) {
    throw new Error('Activation link is invalid.');
  }

  const updateData = {
    activationToken: null,
    isActive: true,
  };

  await authRepository.updateUser(user.id, updateData);
}

async function login(loginData) {
  const { email, password } = loginData;
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    throw new Error('Invalid credentials.');
  }

  if (!user.isActive) {
    throw new Error('Account is not activated.');
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid credentials.');
  }

  const accessToken = randomBytes(32).toString('hex');

  await saveAccessToken(user.id, accessToken);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    accessToken,
  };
}

async function saveAccessToken(userId, accessToken) {
  const tokenDataToCreate = {
    userId,
    token: accessToken,
  };

  const tokenByUserId = await authRepository.findTokenByUserId(userId);

  if (!tokenByUserId) {
    await authRepository.createToken(tokenDataToCreate);
  } else {
    const tokenDataToUpdate = {
      token: accessToken,
    };

    await authRepository.updateToken(userId, tokenDataToUpdate);
  }
}

async function logout(userId) {
  await authRepository.deleteTokenByUserId(userId);
}

async function requestPasswordReset(email) {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    return;
  }

  const resetPasswordToken = randomBytes(32).toString('hex');

  const now = new Date();

  const tokenLifetime =
    Number(process.env.RESET_PASSWORD_TOKEN_LIFETIME_MINUTES) * 60 * 1000;

  const resetPasswordExpiresAt = new Date(now.getTime() + tokenLifetime);

  const passwordResetData = {
    resetPasswordToken,
    resetPasswordExpiresAt,
  };

  await authRepository.updateUser(user.id, passwordResetData);

  await emailService.sendResetPasswordEmail(
    user.email,
    user.name,
    resetPasswordToken,
  );
}

async function validateResetPasswordToken(email, resetPasswordToken) {
  const user = await authRepository.findUserByEmail(email);

  if (
    !user ||
    resetPasswordToken !== user.resetPasswordToken ||
    !user.resetPasswordExpiresAt ||
    new Date().getTime() > user.resetPasswordExpiresAt.getTime()
  ) {
    throw new Error('Invalid or expired password reset link.');
  }

  return user;
}

async function resetPassword({ email, resetPasswordToken, newPassword }) {
  if (newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const user = await validateResetPasswordToken(email, resetPasswordToken);
  const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const updateUserAfterResetPassword = {
    resetPasswordToken: null,
    resetPasswordExpiresAt: null,
    password: hashedNewPassword,
  };

  await authRepository.updateUser(user.id, updateUserAfterResetPassword);
}

async function nameChange({ id, newName }) {
  const trimmedName = newName.trim();

  if (trimmedName.length < 3) {
    throw new Error('Name must be at least 3 characters long.');
  }

  const renameUser = {
    name: trimmedName,
  };

  await authRepository.updateUser(id, renameUser);
}

async function passwordChange({
  user,
  oldPassword,
  newPassword,
  confirmation,
}) {
  if (newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  if (newPassword !== confirmation) {
    throw new Error('The confirmation does not match the password');
  }

  if (!(await bcrypt.compare(oldPassword, user.password))) {
    throw new Error('Invalid credentials.');
  }

  if (oldPassword === newPassword) {
    throw new Error(
      'New password must be different from the current password.',
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  const updateData = {
    password: hashedPassword,
  };

  await authRepository.updateUser(user.id, updateData);
}

async function emailChange({ user, password, pendingEmail }) {
  if (!(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid credentials.');
  }

  if (pendingEmail === user.email) {
    throw new Error('New email must be different from the current email.');
  }

  if (await authRepository.findUserByEmail(pendingEmail)) {
    throw new Error('That email address is already taken.');
  }

  const emailChangeToken = randomBytes(32).toString('hex');
  const tokenLifetime =
    Number(process.env.EMAIL_CHANGE_TOKEN_LIFETIME_MINUTES) * 60 * 1000;
  const now = new Date();
  const emailChangeExpiresAt = new Date(now.getTime() + tokenLifetime);

  const emailChangeData = {
    emailChangeToken,
    emailChangeExpiresAt,
    pendingEmail,
  };

  await authRepository.updateUser(user.id, emailChangeData);

  await emailService.sendEmailChange(pendingEmail, user.name, emailChangeToken);
}

function normalize(user) {
  const normalizedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  return normalizedUser;
}

async function confirmEmailChange({ pendingEmail, emailChangeToken }) {
  const user = await authRepository.findUserByPendingEmailAndEmailChangeToken(
    pendingEmail,
    emailChangeToken,
  );

  if (!user) {
    throw new Error('Invalid email change link.');
  }

  if (
    user.emailChangeExpiresAt === null ||
    new Date().getTime() > user.emailChangeExpiresAt.getTime()
  ) {
    throw new Error('Invalid email change link.');
  }

  const updateData = {
    email: pendingEmail,
    pendingEmail: null,
    emailChangeToken: null,
    emailChangeExpiresAt: null,
  };

  await authRepository.updateUser(user.id, updateData);

  await emailService.sendEmailChangedNotification(user.email, user.name);
}

module.exports = {
  registration,
  activate,
  login,
  logout,
  requestPasswordReset,
  validateResetPasswordToken,
  resetPassword,
  nameChange,
  passwordChange,
  emailChange,
  confirmEmailChange,
  normalize,
};

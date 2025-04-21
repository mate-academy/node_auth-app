const bcrypt = require('bcryptjs');

const { User, PasswordReset } = require('../models/model').model;
const emailService = require('./email.Service');
const passwordReset = require('../models/passwordreset.model');

const isuserAlreadyExists = async (email) => {
  const user = await User.findOne({ where: { email } });

  return user;
};

const registerNewUser = async (user) => {
  try {
    const newuser = await User.create({
      name: user.name,
      email: user.email,
      password: user.password,
      isactive: false,
      activation_token: user.activationKey,
    });
    const mailStatus = await emailService.sendActivationEmail(
      newuser.email,
      newuser.activation_token,
    );

    if (mailStatus) {
      return newuser;
    } else {
      return null;
    }
  } catch (err) {
    return null;
  }
};

const activateUser = async (email) => {
  const [activatedrows, activatedData] = await User.update(
    {
      isactive: true,
      activation_token: null,
    },
    {
      where: { email },
      returning: true,
    },
  );

  return activatedrows ? activatedData[0] : null;
};

const verifyCredentials = async (email, password) => {
  const userData = await User.findOne({ where: { email } });

  if (!userData) {
    return { success: false, code: 404, message: 'User not found' };
  }

  if (!userData.isactive) {
    return {
      success: false,
      code: 403,
      message: 'Kindly activate your account',
    };
  }

  const verifyPassword = await bcrypt.compare(password, userData.password);

  if (!verifyPassword) {
    return { success: false, code: 401, message: 'Invalid credentials' };
  }

  return { success: true, code: 200, user: userData };
};

const triggerResetPassword = async (userData) => {
  const tokenExpiresAt = new Date();

  tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 1);

  const pwdReset = await PasswordReset.create({
    email: userData.email,
    reset_token: userData.token,
    expiresAt: tokenExpiresAt,
  });

  if (!pwdReset) {
    return {
      success: false,
      code: 400,
      message: 'Unable to proceed with password reset process !',
    };
  }

  const resetLink = `http://localhost:5700/auth/reset/${userData.token}`;

  const mailContent = {
    from: 'tech.rj.1405@gmail.com',
    to: userData.email,
    subject: 'Node Auth app - Password Reset email',
    html: `
      <h1>Password Reset !</h1>
      <p>To reset your password, please click the link below and follow the instructions:</p>
      <a href="${resetLink}">Activate Account</a>
    `,
  };

  try {
    await emailService.sendMail(mailContent);

    return {
      success: true,
      code: 200,
      message: 'Link to reset your password has been sent to your email',
    };
  } catch (err) {
    return { success: false, code: 500, message: 'Unable to trigger Email' };
  }
};

const getPasswordResetData = async (email, token) => {
  const passwordResetLink = await PasswordReset.findOne({
    where: { email, reset_token: token },
  });

  return passwordResetLink;
};

const updatePassword = async (userData) => {
  const hashNewPassword = await bcrypt
    .hash(userData.newPassword, 10)
    .then((hashedPassword) => {
      return hashedPassword;
    });

  const [updatedRows, updatedUser] = await User.update(
    { password: hashNewPassword },
    {
      where: {
        email: userData.email,
        id: userData.id,
      },
      returning: true,
    },
  );

  if (updatedRows) {
    await passwordReset.destroy({ where: { reset_token: userData.token } });

    return {
      success: true,
      code: 200,
      message: 'Password Reset Successful ',
      user: updatedUser[0],
    };
  } else {
    return {
      success: false,
      code: 404,
      message: 'Unable to update password. Try again later',
    };
  }
};

const authService = {
  isuserAlreadyExists,
  registerNewUser,
  activateUser,
  verifyCredentials,
  triggerResetPassword,
  updatePassword,
  getPasswordResetData,
};

module.exports = authService;

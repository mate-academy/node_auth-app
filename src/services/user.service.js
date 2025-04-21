const { User } = require('../models/model').model;
const emailService = require('./email.Service');
const bcrypt = require('bcryptjs');

const updateName = async (userData) => {
  const [updatedRows, updatedUser] = await User.update(
    { name: userData.name },
    {
      where: {
        id: userData.id,
        email: userData.email,
      },
      returning: true,
    },
  );

  return updatedRows ? updatedUser[0] : null;
};

const updateEmail = async (userData) => {
  const user = await User.findOne({ where: { email: userData.email } });

  const verifyPassword = await bcrypt.compare(userData.password, user.password);

  if (verifyPassword) {
    try {
      const [updatedRows, updatedUser] = await User.update(
        { email: userData.newEmail },
        {
          where: {
            id: userData.id,
            email: userData.email,
          },
          returning: true,
        },
      );

      if (updatedRows) {
        const mailContent = {
          from: 'tech.rj.1405@gmail.com',
          to: userData.email,
          subject: 'Email Id has been changed',
          html: `
          <h1>Email Id Changed !</h1>
          <p>Your email ID has been changed from ${userData.email} to ${updatedUser[0].email}</p>
        `,
        };

        try {
          await emailService.sendMail(mailContent);

          return { success: true, message: 'Email has been changed' };
        } catch (err) {
          return { success: false, message: err };
        }
      }
    } catch (err) {
      return { success: false, message: err };
    }
  } else {
    return { success: false, message: 'Invalid Password' };
  }
};

const updatePassword = async (userData) => {
  const user = await User.findOne({ where: { email: userData.email } });

  const validateOldPassword = await bcrypt.compare(
    userData.oldPassword,
    user.password,
  );

  if (!validateOldPassword) {
    return { success: false, code: 401, message: 'Invalid credentials' };
  }

  if (userData.oldPassword === userData.newPassword) {
    return {
      success: false,
      code: 404,
      message: 'Old and New password cannot be same',
    };
  }

  const hashNewPassword = await bcrypt.hash(userData.newPassword, 10);
  const [updatedrows, updatedUser] = await User.update(
    { password: hashNewPassword },
    {
      where: {
        email: user.email,
        id: user.id,
      },
      returning: true,
    },
  );

  if (!updatedrows) {
    return {
      success: false,
      code: 404,
      message: 'Unable to update new password',
    };
  }

  return {
    success: true,
    code: 200,
    message: 'Password change successful !!',
    user: updatedUser[0],
  };
};

const userService = { updateName, updateEmail, updatePassword };

module.exports = userService;

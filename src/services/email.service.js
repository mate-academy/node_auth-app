'use strict';

const sendActivationEmail = async (email, token) => {
  // eslint-disable-next-line no-console
  console.log(
    `Activation link for ${email}: http://localhost:3000/activate/${token}`,
  );
};

const sendResetPasswordEmail = async (email, token) => {
  // eslint-disable-next-line no-console
  console.log(`Reset link for ${email}: http://localhost:3000/reset/${token}`);
};

const sendEmailChangedNotification = async (oldEmail, newEmail) => {
  // eslint-disable-next-line no-console
  console.log(`Email changed for ${oldEmail}. New email: ${newEmail}`);
};

module.exports = {
  sendActivationEmail,
  sendResetPasswordEmail,
  sendEmailChangedNotification,
};

'use strict';

const sendActivationEmail = async (email, token) => {
  // eslint-disable-next-line no-console
  console.log(
    `Activation link for ${email}: http://localhost:3000/activate/${token}`,
  );
};

module.exports = {
  sendActivationEmail,
};

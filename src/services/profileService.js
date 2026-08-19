'use strict';

const AppError = require('../utils/AppError');
const { hashPassword, verifyPassword } = require('../utils/passwordHash');
const {
  validateEmailChange,
  validateName,
  validatePasswordChange,
} = require('../validators/profileValidators');

function applyChanges(user, changes) {
  if (typeof user.set === 'function') {
    user.set(changes);

    return;
  }

  Object.assign(user, changes);
}

function createProfileService(users, sessions, mailer) {
  return {
    async updateName(user, name) {
      validateName(name);
      applyChanges(user, { name: name.trim() });
      await users.save(user);

      return user;
    },

    async updatePassword(user, data) {
      const currentPassword = validatePasswordChange(data);

      if (!(await verifyPassword(currentPassword, user.passwordHash))) {
        throw new AppError(401, 'Current password is incorrect');
      }

      applyChanges(user, {
        passwordHash: await hashPassword(data.newPassword),
      });
      await users.save(user);
      await sessions.deleteAllForUser(user.id);
    },

    async updateEmail(user, data) {
      const newEmail = validateEmailChange(data);

      if (!(await verifyPassword(data.password, user.passwordHash))) {
        throw new AppError(401, 'Password is incorrect');
      }

      if (await users.emailExistsForOtherUser(newEmail, user.id)) {
        throw new AppError(409, 'This email is already taken');
      }

      const oldEmail = user.email;

      applyChanges(user, { email: newEmail });
      await users.save(user);
      await mailer.sendEmailChangeNotification(oldEmail, newEmail);

      return user;
    },
  };
}

module.exports = createProfileService;

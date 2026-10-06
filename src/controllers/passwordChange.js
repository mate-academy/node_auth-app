'use strict';

const { Op } = require('sequelize');
const { sequelize } = require('../db');
const { User } = require('../models/User.model');
const { Token } = require('../models/Token.model');
const {
  validatePassword,
  verifyPassword,
  hashPassword,
} = require('../utils/password');

function showError(res, user, message) {
  return res.status(400).render('profile', {
    user: {
      name: user.name,
      email: user.email,
    },
    error: message,
  });
}

async function changePassword(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  try {
    const user = await User.findByPk(req.session.userId);

    if (!user || !user.isActivated) {
      return req.session.destroy((error) => {
        if (error) {
          return next(error);
        }

        return res.redirect('/login');
      });
    }

    const body = req.body || {};
    const { oldPassword, newPassword, confirmation } = body;

    const passwordMatches = await verifyPassword(
      oldPassword,
      user.passwordHash,
    );

    if (!passwordMatches) {
      return showError(res, user, 'Dotychczasowe hasło jest nieprawidłowe.');
    }

    const passwordError = validatePassword(newPassword);

    if (passwordError) {
      return showError(res, user, passwordError);
    }

    if (newPassword !== confirmation) {
      return showError(
        res,
        user,
        'Nowe hasło i potwierdzenie muszą być równe.',
      );
    }

    const passwordHash = await hashPassword(newPassword);

    const changed = await sequelize.transaction(async (transaction) => {
      const [updatedCount] = await User.update(
        { passwordHash },
        {
          where: {
            id: user.id,
            passwordHash: user.passwordHash,
          },
          transaction,
        },
      );

      if (updatedCount !== 1) {
        return false;
      }

      await Token.destroy({
        where: {
          userId: user.id,
          type: {
            [Op.in]: ['passwordReset', 'emailChange'],
          },
        },
        transaction,
      });

      return true;
    });

    if (!changed) {
      return showError(res, user, 'Dane konta zmieniły się. Spróbuj ponownie.');
    }

    return req.session.regenerate((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      req.session.userId = user.id;

      return req.session.save((saveError) => {
        if (saveError) {
          return next(saveError);
        }

        return res.redirect(303, '/profile');
      });
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { changePassword };

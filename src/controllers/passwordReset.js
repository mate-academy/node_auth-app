'use strict';

const { Op } = require('sequelize');
const { sequelize } = require('../db');
const { User } = require('../models/User.model');
const { Token } = require('../models/Token.model');
const { hashToken } = require('../utils/tokens');
const {
  PASSWORD_RULES,
  validatePassword,
  hashPassword,
} = require('../utils/password');

function isValidTokenFormat(token) {
  return typeof token === 'string' && /^[a-f0-9]{64}$/.test(token);
}

function showInvalidLink(res) {
  return res.status(400).render('message', {
    title: 'Nieprawidłowy link',
    message: 'Link wygasł lub został użyty. Poproś o nowy reset hasła.',
  });
}

function findValidToken(token, options = {}) {
  return Token.findOne({
    where: {
      tokenHash: hashToken(token),
      type: 'passwordReset',
      expiresAt: {
        [Op.gt]: new Date(),
      },
    },
    ...options,
  });
}

async function showResetForm(req, res, next) {
  if (req.session.userId) {
    return res.redirect('/profile');
  }

  const token = req.query.token;

  if (!isValidTokenFormat(token)) {
    return showInvalidLink(res);
  }

  try {
    const savedToken = await findValidToken(token);

    if (!savedToken) {
      return showInvalidLink(res);
    }

    res.set('Cache-Control', 'no-store');

    return res.render('reset-password', {
      error: null,
      token,
      passwordRules: PASSWORD_RULES,
    });
  } catch (error) {
    return next(error);
  }
}

async function resetPassword(req, res, next) {
  if (req.session.userId) {
    return res.redirect('/profile');
  }

  const body = req.body || {};
  const { token, password, confirmation } = body;

  if (!isValidTokenFormat(token)) {
    return showInvalidLink(res);
  }

  const passwordError = validatePassword(password);

  if (passwordError || password !== confirmation) {
    return res.status(400).render('reset-password', {
      error: passwordError || 'Podane hasła muszą być identyczne.',
      token,
      passwordRules: PASSWORD_RULES,
    });
  }

  try {
    const savedToken = await findValidToken(token);

    if (!savedToken) {
      return showInvalidLink(res);
    }

    const passwordHash = await hashPassword(password);

    const changed = await sequelize.transaction(async (transaction) => {
      const user = await User.findByPk(savedToken.userId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!user || !user.isActivated) {
        return false;
      }

      const currentToken = await findValidToken(token, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!currentToken || currentToken.userId !== user.id) {
        return false;
      }

      await user.update({ passwordHash }, { transaction });

      await Token.destroy({
        where: {
          userId: user.id,
          type: 'passwordReset',
        },
        transaction,
      });

      return true;
    });

    if (!changed) {
      return showInvalidLink(res);
    }

    return res.redirect(303, '/password-reset/success');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  showResetForm,
  resetPassword,
};

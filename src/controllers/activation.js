'use strict';

const { Op } = require('sequelize');
const { sequelize } = require('../db');
const { User } = require('../models/User.model');
const { Token } = require('../models/Token.model');
const { hashToken } = require('../utils/tokens');

async function activate(req, res, next) {
  if (req.session.userId) {
    return res.redirect('/profile');
  }

  const token = req.query.token;

  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
    return res.status(400).send('Nieprawidłowy link aktywacyjny.');
  }

  try {
    const userId = await sequelize.transaction(async (transaction) => {
      const savedToken = await Token.findOne({
        where: {
          tokenHash: hashToken(token),
          type: 'activation',
          expiresAt: {
            [Op.gt]: new Date(),
          },
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!savedToken) {
        return null;
      }

      const user = await User.findByPk(savedToken.userId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!user || user.isActivated) {
        return null;
      }

      await user.update({ isActivated: true }, { transaction });

      await savedToken.destroy({ transaction });

      return user.id;
    });

    if (!userId) {
      return res
        .status(400)
        .send('Link wygasł, został już użyty lub konto jest już aktywne.');
    }

    return req.session.regenerate((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      req.session.userId = userId;

      return req.session.save((saveError) => {
        if (saveError) {
          return next(saveError);
        }

        return res.redirect('/profile');
      });
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { activate };

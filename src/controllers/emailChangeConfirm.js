'use strict';

const { Op } = require('sequelize');
const { sequelize } = require('../db');
const { User } = require('../models/User.model');
const { Token } = require('../models/Token.model');
const { hashToken } = require('../utils/tokens');
const { sendEmail } = require('../services/mail');

function showInvalidLink(res) {
  return res.status(400).render('message', {
    title: 'Nieprawidłowy link',
    message:
      'Link wygasł, został użyty lub należy do innego konta. ' +
      'Zaloguj się na właściwe konto i ponownie otwórz link.',
  });
}

async function confirmEmailChange(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  const token = req.query.token;

  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
    return showInvalidLink(res);
  }

  try {
    const result = await sequelize.transaction(async (transaction) => {
      const user = await User.findByPk(req.session.userId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!user || !user.isActivated) {
        return null;
      }

      const savedToken = await Token.findOne({
        where: {
          userId: user.id,
          tokenHash: hashToken(token),
          type: 'emailChange',
          expiresAt: {
            [Op.gt]: new Date(),
          },
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!savedToken || !savedToken.newEmail) {
        return null;
      }

      const oldEmail = user.email;
      const newEmail = savedToken.newEmail;

      if (oldEmail === newEmail) {
        return null;
      }

      await user.update({ email: newEmail }, { transaction });

      await Token.destroy({
        where: {
          userId: user.id,
          type: {
            [Op.in]: ['emailChange', 'passwordReset'],
          },
        },
        transaction,
      });

      return { oldEmail, newEmail };
    });

    if (!result) {
      return showInvalidLink(res);
    }

    let notificationSent = true;

    try {
      await sendEmail({
        to: result.oldEmail,
        subject: 'Adres e-mail Twojego konta Auth App został zmieniony',
        text: [
          'Adres e-mail przypisany do Twojego konta został zmieniony.',
          `Poprzedni adres: ${result.oldEmail}`,
          `Nowy adres: ${result.newEmail}`,
          '',
          'Jeżeli to nie Ty dokonałeś zmiany,',
          'skontaktuj się z administratorem aplikacji.',
        ].join('\n'),
      });
    } catch (error) {
      notificationSent = false;

      process.stderr.write(
        `Błąd powiadomienia na poprzedni adres: ${error.message}\n`,
      );
    }

    return req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      res.clearCookie('auth.sid', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      const message = notificationSent
        ? 'Adres został zmieniony. Zaloguj się nowym adresem e-mail.'
        : 'Adres został zmieniony, ale powiadomienie na stary adres ' +
          'nie zostało wysłane. Zaloguj się nowym adresem e-mail.';

      return res.render('message', {
        title: 'Adres e-mail został zmieniony',
        message,
      });
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).render('message', {
        title: 'Adres jest już zajęty',
        message:
          'Nie zmieniono adresu konta. ' +
          'Wróć do profilu i wybierz inny adres e-mail.',
      });
    }

    return next(error);
  }
}

module.exports = { confirmEmailChange };

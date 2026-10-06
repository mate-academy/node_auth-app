'use strict';

const { User } = require('../models/User.model');
const { verifyPassword } = require('../utils/password');
const { createToken } = require('../utils/tokens');
const { sendEmail } = require('../services/mail');

function showError(res, user, message) {
  return res.status(400).render('profile', {
    user: {
      name: user.name,
      email: user.email,
    },
    error: message,
  });
}

async function requestEmailChange(req, res, next) {
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
    const newEmail =
      typeof body.newEmail === 'string'
        ? body.newEmail.trim().toLowerCase()
        : '';

    const passwordMatches = await verifyPassword(
      body.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      return showError(res, user, 'Podane hasło jest nieprawidłowe.');
    }

    if (newEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return showError(res, user, 'Podaj poprawny nowy adres e-mail.');
    }

    if (newEmail === user.email) {
      return showError(res, user, 'Nowy adres musi różnić się od obecnego.');
    }

    const existingUser = await User.findOne({
      where: { email: newEmail },
    });

    if (existingUser) {
      return showError(res, user, 'Ten adres e-mail jest już zajęty.');
    }

    const token = await createToken(user.id, 'emailChange', newEmail);
    const confirmationUrl = new URL(
      '/confirm-email-change',
      process.env.APP_URL,
    );

    confirmationUrl.searchParams.set('token', token);

    try {
      await sendEmail({
        to: newEmail,
        subject: 'Potwierdź nowy adres e-mail w Auth App',
        text: [
          'Aby potwierdzić zmianę adresu e-mail, otwórz ten link:',
          confirmationUrl.toString(),
          '',
          'Link jest ważny przez godzinę.',
          'Jeśli nie prosiłeś o zmianę adresu, zignoruj wiadomość.',
        ].join('\n'),
      });
    } catch (error) {
      process.stderr.write(
        `Nie udało się wysłać potwierdzenia e-mail: ${error.message}\n`,
      );

      return showError(
        res,
        user,
        'Nie udało się wysłać wiadomości. Spróbuj ponownie później.',
      );
    }

    return res.redirect(303, '/profile/email/sent');
  } catch (error) {
    return next(error);
  }
}

module.exports = { requestEmailChange };

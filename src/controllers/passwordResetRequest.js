'use strict';

const { User } = require('../models/User.model');
const { createToken } = require('../utils/tokens');
const { sendEmail } = require('../services/mail');

async function requestPasswordReset(req, res, next) {
  if (req.session.userId) {
    return res.redirect('/profile');
  }

  const body = req.body || {};
  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).render('password-reset', {
      error: 'Podaj poprawny adres e-mail.',
      email,
    });
  }

  try {
    const user = await User.findOne({
      where: {
        email,
        isActivated: true,
      },
    });

    if (user) {
      const token = await createToken(user.id, 'passwordReset');
      const resetUrl = new URL('/reset-password', process.env.APP_URL);

      resetUrl.searchParams.set('token', token);

      try {
        await sendEmail({
          to: user.email,
          subject: 'Resetowanie hasła w Auth App',
          text: [
            'Aby ustawić nowe hasło, otwórz poniższy link:',
            resetUrl.toString(),
            '',
            'Link jest ważny przez godzinę.',
            'Jeśli nie prosiłeś o zmianę hasła, zignoruj wiadomość.',
          ].join('\n'),
        });
      } catch (error) {
        process.stderr.write(
          `Nie udało się wysłać resetu hasła: ${error.message}\n`,
        );
      }
    }

    return res.redirect(303, '/password-reset/sent');
  } catch (error) {
    return next(error);
  }
}

module.exports = { requestPasswordReset };

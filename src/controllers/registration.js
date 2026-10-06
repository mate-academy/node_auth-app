'use strict';

const { User } = require('../models/User.model');
const {
  PASSWORD_RULES,
  validatePassword,
  hashPassword,
  verifyPassword,
} = require('../utils/password');
const { createToken } = require('../utils/tokens');
const { sendEmail } = require('../services/mail');

function showError(res, values, message, status = 400) {
  return res.status(status).render('register', {
    error: message,
    values,
    passwordRules: PASSWORD_RULES,
  });
}

async function register(req, res, next) {
  if (req.session.userId) {
    return res.redirect('/profile');
  }

  const body = req.body || {};
  const values = {
    name: typeof body.name === 'string' ? body.name.trim() : '',
    email:
      typeof body.email === 'string' ? body.email.trim().toLowerCase() : '',
  };

  if (!values.name || values.name.length > 255) {
    return showError(res, values, 'Podaj imię: od 1 do 255 znaków.');
  }

  if (
    values.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
  ) {
    return showError(res, values, 'Podaj poprawny adres e-mail.');
  }

  const passwordError = validatePassword(body.password);

  if (passwordError) {
    return showError(res, values, passwordError);
  }

  if (body.password !== body.confirmation) {
    return showError(res, values, 'Podane hasła muszą być identyczne.');
  }

  try {
    let user = await User.findOne({
      where: { email: values.email },
    });

    if (user) {
      const passwordMatches = await verifyPassword(
        body.password,
        user.passwordHash,
      );

      if (user.isActivated || !passwordMatches) {
        return showError(
          res,
          values,
          'Ten adres jest już zajęty. Zaloguj się lub zresetuj hasło.',
        );
      }
    } else {
      const passwordHash = await hashPassword(body.password);

      user = await User.create({
        name: values.name,
        email: values.email,
        passwordHash,
      });
    }

    const token = await createToken(user.id, 'activation');
    const activationUrl = new URL('/activate', process.env.APP_URL);

    activationUrl.searchParams.set('token', token);

    try {
      await sendEmail({
        to: user.email,
        subject: 'Potwierdź rejestrację w Auth App',
        text: [
          'Aby aktywować konto, otwórz poniższy link:',
          activationUrl.toString(),
          '',
          'Link jest ważny przez 24 godziny.',
          'Jeśli nie zakładałeś konta, zignoruj tę wiadomość.',
        ].join('\n'),
      });
    } catch {
      return showError(
        res,
        values,
        'Wysyłka nie powiodła się. Spróbuj ponownie z tym samym hasłem.',
        503,
      );
    }

    return res
      .status(200)
      .send('Sprawdź pocztę i folder Spam. Wysłaliśmy link aktywacyjny.');
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return showError(res, values, 'Ten adres e-mail jest już zajęty.');
    }

    if (error.name === 'SequelizeValidationError') {
      return showError(res, values, 'Sprawdź poprawność danych.');
    }

    return next(error);
  }
}

module.exports = { register };

'use strict';

const passport = require('passport');
// Це бібліотека для організації автентифікації.
// Вона дозволяє налаштовувати різні способи перевірки
// користувачів і використовувати їх у маршрутах сервера.
const { Strategy: LocalStrategy } = require('passport-local');
// passport-local
// Бібліотека для стратегії, за якою користувач входить за логіном і паролем.
// У твоєму проєкті логіном буде email.
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const { isRevoked } = require('../service/newfile');
// список номерів токенів які ревркнулись

// passport-jwt
// Бібліотека для іншого способу автентифікації:
// перевірки JWT-токена, який клієнт надсилає серверу.
const bcrypt = require('bcryptjs');

// bcryptjs
// Бібліотека для роботи з хешами паролів.
// Тут вона потрібна,
// щоб порівняти введений пароль із хешем, який збережено в базі даних.

const { User } = require('../User.model');
const { getSecret } = require('../service/jwt.service');

// Логін: email + password
passport.use(
  // використовуємо passport для організації автентифікації
  new LocalStrategy(
    { usernameField: 'email', session: false },
    // кидаємо пасспорту два аргументи, usernameField - кажемо що наший логін
    // це email,
    // session: false - означає що наший JWT токен
    // буде без сесій та cookie
    async (email, password, done) => {
      // очікуємо email та password саме від клієнта
      try {
        const user = await User.findOne({
          // один юзер, беремо з усієї таблиці першого юзера
          where: { email: String(email).trim().toLowerCase() },
          //  типу потім знаходимо рядок який дорівнює ось цьому значенню:
          // email: String(email).trim().toLowerCase()
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
          return done(null, false, { message: 'Wrong email or password' });
        } // якщо юзера немає або ми не отримали відповідь від bcrypt,
        // а bcrypt типу як просто порівнює password та user.password
        // і повертає булеве значення
        // тобто це перевірка на те чи email чи password
        // такий існує та підходить

        if (!user.isActive) {
          return done(null, false, {
            message: 'Account is not activated. Check your email.',
          });
        } // якщо !user.isActive, кидаємо ось це:
        // 'Account is not activated. Check your email.'
        // куди воно саме приходить, ніхто гадки немає

        return done(null, user);
        // якщо все перевірки пройшли, просто повертаємо юзера
      } catch (error) {
        return done(error);
      }
    },
  ),
);

// Перевірка за JWT токеном
passport.use(
  new JwtStrategy(
    {
      // Вказуємо, звідки брати токен у HTTP-запиті:
      // Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Секретний ключ із .env, потрібний для перевірки підпису токена
      secretOrKey: getSecret(),
      passReqToCallback: true, //
    },

    // payload — дані з перевіреного токена, декодований об'єкт
    // done — повідомляє Passport результат перевірки користувача
    async (req, payload, done) => {
      try {
        if (isRevoked(payload.jti)) {
          return done(null, false);
        }

        // якщо isRevoked - payload.jti,
        //  тобто ми беремо з наших даних токену цей номер
        //  тобто JWT генерує токен,
        //  ми кидаємо його номер в revoke,
        //  чи isRevoked, а також в самий токен, а потім тупо звіряємо його
        //  на цьому етапі при перевірці в PAssport,
        //  чи типу такий ще досі не активний чи вже активний,
        //  якщо він активний то кидаємо return done(null, false);?

        req.tokenPayload = payload;

        // Шукаємо користувача в базі за його ID із токена
        const user = await User.findByPk(payload.sub);

        // Якщо користувач існує й акаунт активний — передаємо user.
        // Інакше передаємо false.
        return done(null, user && user.isActive ? user : false);
      } catch (error) {
        // Якщо виникла системна помилка — передаємо її Passport
        return done(error, false);
      }
    },
  ),
);

module.exports = passport;

// LocalStrategy — перевіряє email і пароль під час входу.

// JwtStrategy — перевіряє токен під час наступних запитів.

/* passport.use(
//  new LocalStrategy(
//    {
//      usernameField: 'email',
//      session: false,
//      passReqToCallback: true // <-- ОСЬ ЦЕЙ ПРАПОРЕЦЬ
    },
    // Тепер першим аргументом у нашу
    // функцію прилетить весь об'єкт запиту (req)!
    async (req, email, password, done) => {
      try {
        // Ми можемо дістати будь-яке поле з тіла запиту (req.body)
        const { someNewField } = req.body;

        const user = await User.findOne({
          where: {
            email: String(email).trim().toLowerCase(),
            // І тепер спокійно використовуємо це поле в пошуку чи перевірці:
            someColumnInDb: someNewField
          },
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
          return done(null, false, { message: 'Wrong credentials' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ),
); */

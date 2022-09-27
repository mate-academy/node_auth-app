const LocalStrategy = require('passport-local');
const crypto = require('crypto');
const { getOneByField } = require('../services/users');

const localStrategy = new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, (email, password, next) => {
  getOneByField({ email })
    .then(user => {
      if (!user) {
        return next(null, false, {
          message: 'Incorrect email or password',
        });
      }

      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        'sha256',
        (err, hashedPassword) => {
          if (err) {
            return next(err);
          }

          if (user.hashed_password !== hashedPassword.toString('hex')) {
            return next(null, false, {
              message: 'Incorrect email or password',
            });
          }

          return next(null, user);
        },
      );
    });
});

module.exports = { localStrategy };

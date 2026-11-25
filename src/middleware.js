'use strict';

const { page } = require('./pages');

function guestOnly(req, res, next) {
  if (req.user) {
    return res.redirect(303, '/profile');
  }
  next();
}

function userOnly(req, res, next) {
  if (!req.user) {
    return res.redirect(303, '/login');
  }
  next();
}

function verifyCsrf(req, res, next) {
  if (!req.session.csrf || req.body?._csrf !== req.session.csrf) {
    return page(req, res, 'Request expired', {
      status: 403,
      message: 'Open the form again and retry.',
    });
  }

  next();
}

function startSession(req, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        return reject(error);
      }

      req.session.userId = user.id;
      req.session.version = user.version;

      req.session.save((saveError) => {
        if (saveError) {
          return reject(saveError);
        }
        resolve();
      });
    });
  });
}

module.exports = {
  guestOnly,
  userOnly,
  verifyCsrf,
  startSession,
};

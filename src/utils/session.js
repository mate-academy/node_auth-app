'use strict';

const cryptoUtils = require('./crypto');

function regenerate(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        reject(error);

        return;
      }

      resolve();
    });
  });
}

function setFlash(req, type, msg) {
  req.session.flash = { type, msg };
}

async function startSession(req, user) {
  await regenerate(req); // prevents session fixation
  req.session.csrf = cryptoUtils.randomToken(24);
  req.session.uid = user.id;
  req.session.tokenVersion = user.tokenVersion;
}

async function endSession(req) {
  await regenerate(req);
  req.session.csrf = cryptoUtils.randomToken(24);
}

module.exports = {
  setFlash,
  startSession,
  endSession,
};

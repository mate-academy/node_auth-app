'use strict';

const nodeCrypto = require('node:crypto');

function csrf(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = nodeCrypto.randomBytes(32).toString('hex');
  }

  res.locals.csrfToken = req.session.csrfToken;

  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const submittedToken = req.body && req.body._csrf;

  if (typeof submittedToken !== 'string') {
    return res.status(403).send('Brak tokenu formularza. Odśwież stronę.');
  }

  const expected = Buffer.from(req.session.csrfToken, 'utf8');
  const received = Buffer.from(submittedToken, 'utf8');

  if (
    expected.length !== received.length ||
    !nodeCrypto.timingSafeEqual(expected, received)
  ) {
    return res.status(403).send('Nieprawidłowy token. Odśwież stronę.');
  }

  return next();
}

module.exports = { csrf };

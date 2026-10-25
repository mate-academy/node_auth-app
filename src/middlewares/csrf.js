'use strict';

const nodeCrypto = require('crypto');
const cryptoUtils = require('../utils/crypto');
const errorViews = require('../views/errorViews');

function hasValidToken(req) {
  const sent = Buffer.from(String((req.body && req.body.csrfToken) || ''));
  const real = Buffer.from(req.session.csrf);

  return sent.length === real.length && nodeCrypto.timingSafeEqual(sent, real);
}

function csrfProtection(req, res, next) {
  if (!req.session.csrf) {
    req.session.csrf = cryptoUtils.randomToken(24);
  }

  res.locals.csrfToken = req.session.csrf;

  if (req.method === 'POST' && !hasValidToken(req)) {
    const view = {
      title: 'Invalid request',
      heading: 'Invalid request',
      text: 'Your session expired. Go back, reload and try again.',
    };

    res.page(403, errorViews.message(res.locals, view));

    return;
  }

  next();
}

module.exports = csrfProtection;

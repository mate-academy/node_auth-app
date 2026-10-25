'use strict';

const errorViews = require('../views/errorViews');

function createRateLimiter(max, windowMs) {
  const hits = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const record = hits.get(req.ip);

    if (hits.size > 10000) {
      hits.forEach((value, key) => {
        if (value.reset < now) {
          hits.delete(key);
        }
      });
    }

    if (!record || record.reset < now) {
      hits.set(req.ip, { count: 1, reset: now + windowMs });
      next();

      return;
    }

    record.count += 1;

    if (record.count > max) {
      const view = {
        title: 'Too many requests',
        heading: 'Too many attempts',
        text: 'Please wait a few minutes and try again.',
      };

      res.page(429, errorViews.message(res.locals, view));

      return;
    }

    next();
  };
}

const authLimiter = createRateLimiter(20, 15 * 60 * 1000);

module.exports = {
  createRateLimiter,
  authLimiter,
};

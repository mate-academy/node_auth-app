'use strict';

const passwordRules = require('../validators/passwordRules');

const rules = passwordRules.rulesForView();

// Data shared by every view (res.locals) plus res.page(), which sends HTML.
// The flash message is only consumed when a page is actually sent
// (not on redirects or assets).
function viewLocals(req, res, next) {
  const message = req.session.flash || null;

  res.locals.currentUser = req.user;
  res.locals.passwordRules = rules;
  res.locals.flash = message;

  res.page = (httpStatus, markup) => {
    if (message) {
      delete req.session.flash;
    }

    res.status(httpStatus).type('html').send(markup);
  };

  next();
}

module.exports = viewLocals;

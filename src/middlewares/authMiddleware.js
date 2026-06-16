const isAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }

  return res.redirect('/login');
};

const isGuest = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/profile');
  }

  return next();
};

module.exports = { isAuth, isGuest };

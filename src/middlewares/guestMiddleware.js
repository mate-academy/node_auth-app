export const guestMiddleware = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect('/profile');
  }
  next();
};

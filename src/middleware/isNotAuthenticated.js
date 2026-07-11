module.exports = (req, res, next) => {
  // Якщо в сесії Є id користувача — значить він уже залогінений
  if (req.session && req.session.userId) {
    return res.redirect('/profile');
  }

  // Якщо він гість — усе ок, хай іде далі
  next();
};

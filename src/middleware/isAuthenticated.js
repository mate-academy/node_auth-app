module.exports = (req, res, next) => {
  // Перевіряємо, чи є в сесії ID користувача
  if (req.session && req.session.userId) {
    return next(); // Усе супер, пускаємо далі до наступної функції
  }

  // Якщо ID немає — користувач не увійшов, викидаємо його на логін
  res.redirect('/login');
};

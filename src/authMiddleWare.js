const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });

    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send(`
      <html>
        <head><title>Помилка авторизації</title></head>
        <body>
          <h1>Авторизація потрібна</h1>
          <p>Ваш токен відсутній. Будь ласка, увійдіть знову.</p>
          <a href="/login">Перейти на сторінку входу</a>
        </body>
      </html>
    `);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send(`
      <html>
        <head><title>Токен недійсний</title></head>
        <body>
          <h1>Ваш токен недійсний або прострочений</h1>
          <p>Будь ласка, запросіть нове посилання або увійдіть ще раз.</p>
          <a href="/login">Увійти знову</a>
        </body>
      </html>
    `);
  }
};

module.exports = authenticate;

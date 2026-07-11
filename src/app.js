const express = require('express');
const path = require('path');
const session = require('express-session');
const passwordRoutes = require('./routes/password');
const profileRoutes = require('./routes/profile');

const app = express();

app.use(
  session({
    secret: 'my-super-secret-key', // Секретний рядок для шифрування сесії
    resave: false, // Не зберігати сесію наново, якщо вона не змінилася
    saveUninitialized: false,
    cookie: {
      secure: false, // false, бо ми тестуємо на localhost (без HTTPS)
      maxAge: 1000 * 60 * 60 * 24, // Час життя сесії: 1 день
    },
  }),
);

// 1. Налаштування шаблонізатора EJS
app.set('view engine', 'ejs');
// Вказуємо абсолютний шлях до папки views
app.set('views', path.join(__dirname, 'views'));

// 2. Middleware для обробки даних (дуже важливо для POST-запитів з форм)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const authRoutes = require('./routes/auth');

app.use('/', authRoutes);

app.use('/password', passwordRoutes);
app.use('/profile', profileRoutes);
// 3. Папка для статики (CSS, картинки)
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res) => {
  res.status(404).render('404');
});

// 4. Тимчасовий тестовий роут, щоб перевірити, що все ок
app.get('/', (req, res) => {
  res.send('<h1>Сервер працює! EJS та Express налаштовані. 🚀</h1>');
});

// Експортуємо налаштований app
module.exports = app;

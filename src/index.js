const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const { renderLayout } = require('./views/layout');

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'super-secret-key',
    resave: false,
    saveUninitialized: false,
  }),
);

app.use((req, res, next) => {
  // Pass these to the layout builder in routes
  res.locals.user = req.session.user || null;
  res.locals.error = req.session.error || null;
  res.locals.message = req.session.message || null;
  next();
});

app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/profile');
  } else {
    res.redirect('/login');
  }
});

app.use('/', authRoutes);
app.use('/profile', profileRoutes);

app.use((req, res) => {
  const body = `<h1>404 Not Found</h1><p>The page you are looking for does not exist.</p>`;
  const html = renderLayout(
    '404',
    body,
    req.session.user,
    req.session.error,
    req.session.message,
  );

  res.status(404).send(html);
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    // server started
  });
}

module.exports = app;

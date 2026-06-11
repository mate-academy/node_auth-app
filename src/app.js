'use strict';

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { router: authRouter } = require('./routes/auth');
const { router: passwordRouter } = require('./routes/passwordReset');
const { router: profileRouter } = require('./routes/profile');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/auth', authRouter);
app.use('/password', passwordRouter);
app.use('/profile', profileRouter);

app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

app.use((req, res) => {
  res.status(404).render('errors/404', { title: 'Not Found' });
});

module.exports = app;

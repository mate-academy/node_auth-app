// src/app.js
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/auth', require('./routes/auth'));
app.use('/profile', require('./routes/profile'));

module.exports = app;

'use strict';

require('dotenv').config();

const express = require('express');

const app = express();

const { authRouter } = require('./api/auth.router');
const { authMiddleware } = require('./middleware/auth.middleware');
const { profileRouter } = require('./api/profile.router');

app.use(express.json());
app.use('/auth', authRouter);
app.use('/profile', authMiddleware, profileRouter);

app.get('/', (req, res) => {
  res.send('Auth app works');
});

app.use((req, res) => {
  return res.status(404).json({
    message: 'Page not found',
  });
});

const PORT = 3000;

app.listen(PORT, () => {
  process.stdout.write(`Server is running on http://localhost:${PORT}\n`);
});

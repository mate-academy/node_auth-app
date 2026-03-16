'use strict';

const express = require('express');
const authRouter = require('./routes/auth.router');
const userRouter = require('./routes/user.router');
const errorHandler = require('./middlewares/errorHandler.middleware');

function createApp() {
  const app = express();

  // ── Body parsing ───────────────────────────────────────────────────────────
  app.use(express.json());

  // ── Health check ───────────────────────────────────────────────────────────
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  // ── Feature routers ────────────────────────────────────────────────────────
  app.use('/api/auth', authRouter);
  app.use('/api/user', userRouter);

  // ── 404 catch-all ──────────────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // ── Central error handler ──────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
}

module.exports = createApp;

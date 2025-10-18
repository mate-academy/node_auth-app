const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/auth', authRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;

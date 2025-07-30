/* eslint-disable no-console */

'use strict';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(express.json());
app.use('/api/user', userRoutes);

app.use('/api/auth', authRoutes);

// 404 middleware
app.use((req, res) => {
  res.status(404).json({ message: 'Сторінку не знайдено' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

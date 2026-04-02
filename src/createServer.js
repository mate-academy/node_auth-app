import express from 'express';
import cors from 'cors';
import { userRoutes } from './routes/userRoutes.js';

export const createServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/users', userRoutes);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  return app;
};

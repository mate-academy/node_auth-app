import { Router } from 'express';
import { prisma } from '../db';
import { ApiError } from '../exceptions/ApiError';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

healthRouter.get('/error', async () => {
  throw ApiError.badRequest('Test error', { email: 'Email is invalid' });
});

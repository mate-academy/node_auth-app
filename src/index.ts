import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { AppError } from './errors/AppError.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { profileRoutes } from './modules/profile/profile.routes.js';
import cookieParser from 'cookie-parser';
import { pagesRoutes } from './modules/pages/pages.routes.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(pagesRoutes);

//
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
//

app.use((_req, _res, next) => {
  next(new AppError(404, 'Route not found'));
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

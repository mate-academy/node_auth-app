import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import { notFoundMiddleware } from './middlewares/notFound.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import profileRoutes from './routes/profile.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Auth API is running');
});

app.use('/auth', authRoutes);
app.use(profileRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;

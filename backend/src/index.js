import express from 'express';
import authRoutes from './routes/auth.route.js';
import profileRoutes from './routes/profile.route.js';
import passwordRoutes from './routes/password.route.js';

const app = express();

app.use(express.json());

app.use('/profile', profileRoutes);

app.use('/password', passwordRoutes);

app.use('/auth', authRoutes);

app.use((_, res) => res.status(404).json({ messager: 'Not found' }));

export default app;

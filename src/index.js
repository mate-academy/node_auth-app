import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/api', authRoutes);

app.use((req, res) => {
  res
    .status(404)
    .json({ message: 'Opps! This page was not found on the backend' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {});

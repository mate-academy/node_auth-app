/* eslint-disable no-console */
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import sequelize from './config/db.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate(); // Ensures DB connection
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  } catch (error) {
    console.error('Database connection failed:', error);
  }
});

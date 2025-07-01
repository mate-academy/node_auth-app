import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
);

// Test endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Authentication API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mock auth endpoints for testing
app.post('/auth/registration', (req, res) => {
  res.status(400).json({
    message:
      'Database not configured. Please set up your .env file and run migrations.',
    error: 'DATABASE_NOT_CONFIGURED',
  });
});

app.get('/auth/activation/:email/:token', (req, res) => {
  res.status(400).json({
    message:
      'Database not configured. Please set up your .env file and run migrations.',
    error: 'DATABASE_NOT_CONFIGURED',
  });
});

app.post('/auth/login', (req, res) => {
  res.status(400).json({
    message:
      'Database not configured. Please set up your .env file and run migrations.',
    error: 'DATABASE_NOT_CONFIGURED',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.listen(port, () => {
  console.log(`🚀 Test server running on port ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
  console.log(`🔧 To run full server: npm run dev`);
});

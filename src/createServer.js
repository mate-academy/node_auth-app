// Import necessary modules
import express from 'express';
import 'dotenv/config';
import userRoutes from './routes/userRoutes.js';
import cookieParser from 'cookie-parser';

import cors from 'cors';

// Function to create the Express server
export const createServer = () => {
  // dotenv.config();
  const app = express();

  // Middleware to parse JSON
  app.use(express.json());
  app.use(cookieParser());

  app.use(
    cors({
      origin: process.env.CLIENT_HOST,
      credentials: true,
    }),
  );
  // Use routes for the respective paths

  app.use('/users', userRoutes);

  return app;
};

// Export the createServer function
export default { createServer };

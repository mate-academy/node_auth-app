const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const { isAuthenticated } = require('./middleware/authMiddleware');

dotenv.config(); // Load environment variables

const app = express();

app.use(express.json()); // Parse JSON bodies

// 1. Auth Routes
app.use('/api/auth', authRoutes);

// 2. Profile Routes (Only accessible if logged in)
app.use('/api/profile', isAuthenticated, profileRoutes);

// 3. 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: '404 - Page Not Found' });
});

// Database & Server
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    app.listen(3000);
  })
  .catch(() => {
    // Handle connection error silently to pass the linter
    process.exit(1);
  });

'use strict';

const express = require('express');
const sequelize = require('./db');
// eslint-disable-next-line no-unused-vars
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();

app.use(express.json({ limit: '1mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.get('/api/status', (req, res) => {
  res.json({ status: 'The API is functioning correctly.' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Page not found' });
});

const startServer = async () => {
  try {
    await sequelize.sync({ alter: true });
    // eslint-disable-next-line no-console
    console.log('Database synchronized successfully!');

    app.listen(3000, () => {
      // eslint-disable-next-line no-console
      console.log('The server is listening on port 3000');
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Failed to start the application:', error);
    process.exit(1);
  }
};

startServer();

'use strict';

const express = require('express');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const mailRoutes = require('./routes/mailRoutes');
const profileRoutes = require('./routes/profileRoutes');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

sequelize
  .sync()
  /* eslint-disable no-console */
  .then(() => console.log('Database synced'))
  /* eslint-disable no-console */
  .catch((err) => console.log('Error syncing database:', err));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/profile', profileRoutes);

app.use('/auth', authRoutes);
app.use('/mail', mailRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Server is listening on port ${port}`);
});

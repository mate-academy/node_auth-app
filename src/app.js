const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
  res.send('API is working');
});

app.use((req, res, next) => {
  res.status(404).json({ message: 'Page not found' });
});

module.exports = app;

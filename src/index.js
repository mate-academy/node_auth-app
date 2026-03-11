'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { router: authRouter } = require('./routes/auth.route');
const { router: userRouter } = require('./routes/user.route');
const { errorMiddleware } = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use(authRouter);
app.use('/users', userRouter);

app.get('/', (req, res) => {
  res.send('hello');
});

app.use((req, res, next) => {
  res.status(404).send({
    message: 'Page not found',
    url: req.originalUrl,
  });
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  // console.log(`Server running on port ${PORT}`);
});

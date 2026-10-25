'use strict';
require('dotenv/config');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { authRouter } = require('./routes/auth.route.js');
const { userRouter } = require('./routes/user.route.js');
const { profileRouter } = require('./routes/profile.route.js');
const { errorMiddleware } = require('./middlewares/errorMiddleware.js');
const { client } = require('./utils/db.js');
const { ApiError } = require('./exception/api.error.js');

require('./models/token.js');

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use(authRouter);
app.use('/users', userRouter);

app.use(profileRouter);

app.get('/', (req, res) => {
  res.send('Hello');
});

app.use((req, res, next) => {
  next(ApiError.notFound('Not found'));
});

app.use(errorMiddleware);

client
  .sync({ alter: true })
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log('server is running');
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console, handle-callback-err
    console.log('Failed to sync DB:', err);
  });

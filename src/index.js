'use strict';

require('dotenv/config');

const express = require('express');
const cors = require('cors');
const { authRouter } = require('./routes/auth.route.js');
const { userRouter } = require('./routes/user.route.js');
const { errorMiddleware } = require('./middlewares/errorMiddleware.js');
const cookieParser = require('cookie-parser');

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

app.use((req, res) => {
  res.status(404).send('Page Not Found');
});
app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line
  console.log(`Server is running on ${PORT}`);
});

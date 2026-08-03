'use strict';

require('dotenv/config');

const cors = require('cors');
const express = require('express');
const { router } = require('./routes/authRouter.js');
const { userRouter } = require('./routes/userRouter.js');
const { errorMiddleware } = require('./middleware/errorMiddleware.js');
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 3005;
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_HOST || 'http://localhost:5173',
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(router);
app.use(userRouter);
app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('server is running');
});

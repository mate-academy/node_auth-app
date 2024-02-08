'use strict';

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { authRouter } = require('./routes/auth.route');
const { userRouter } = require('./routes/user.route');
const { errorMiddleware } = require('./middlewares/errorMiddleware');

dotenv.config();

const PORT = process.env.API_PORT || 3005;
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.CLIENT_HOST,
  credentials: true,
}));

app.use('/', authRouter);
app.use('/users', userRouter);

app.use(errorMiddleware);

app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`);
});

'use strict';

require('dotenv').config();

const express = require('express');
const { authRouter } = require('./routes/auth.route');
// const { userRouter } = require('./routes/user.route.js');
const { errorMiddleware } = require('./middlewares/errorMiddleware');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 8080;

const app = express();

app.use(cors({
  origin: process.env.CLIENT_HOST,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use(authRouter);

// app.use('/users', userRouter);
app.get('/', (req, res) => {
  res.send('Hello world');
});

app.use(errorMiddleware);

app.listen(PORT,
  // eslint-disable-next-line no-console
  () => console.log(`Server start on port:${PORT}`)
);

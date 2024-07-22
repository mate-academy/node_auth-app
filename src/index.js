'use strict';

require('dotenv/config');

const express = require('express');
const { authRouter } = require('./routes/auth.route.js');
const { userRouter } = require('./routes/user.route.js');
const cookieParser = require('cookie-parser');
const { errorMidleware } = require('./middlewares/errorMidleware.js');

const PORT = process.env.PORT || 3004;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(authRouter);
app.use('/user', userRouter);

app.get('/', (req, res) => {
  res.send('hello');
});

app.use(errorMidleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is raning: http://localhost:${PORT}`);
});

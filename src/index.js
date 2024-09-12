require('dotenv/config');

const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');

const { authRouter } = require('./routes/authRouter.js');
const { userRouter } = require('./routes/userRouter.js');
const { errorMiddleware } = require('./middlewares/errorMiddleware.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(authRouter);
app.use('/user', userRouter);
app.use(errorMiddleware);

app.listen(PORT);

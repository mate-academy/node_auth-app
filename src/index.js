require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth.route');
const userRouter = require('./routes/user.route');
const {
  errorMiddleware,
  notFoundMiddleware,
} = require('./middlewares/errorMiddleware');

const PORT = process.env.PORT || 3005;

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.options(
  '*',
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(authRouter);
app.use('/users', userRouter);
app.use(errorMiddleware);
app.use(notFoundMiddleware);

app.get('/', (req, res) => {
  res.send('hello');
});

app.listen(PORT, () => {
  /* eslint-disable-next-line no-console */
  console.log('server is running on the port:', PORT);
});

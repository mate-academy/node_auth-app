const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const {
  authRouter,
  expensesRouter,
  usersRouter,
  socialRouter,
} = require('./routes');
const passport = require('./config/passport.js');
const { errorMiddleware } = require('./middlewares');

require('dotenv/config');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

app.use('/users', usersRouter);
app.use('/expenses', expensesRouter);
app.use(authRouter);
app.use(socialRouter);

app.use((req, res) => {
  res.status(404).send({ message: 'Not found' });
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on localhost:${PORT}`);
});

require('dotenv/config');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { client } = require('./utils/db');

require('./models/user');

const { authRouter } = require('./routes/auth.route');
const { userRouter } = require('./routes/user.route');
const { erroMidlleware } = require('./midlleware/erroMidlleware');

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
  res.status(404).json({
    message: 'Not Found',
  });
});

app.use(erroMidlleware);

const start = async () => {
  try {
    await client.authenticate();

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to the database:', error);
  }
};

start();

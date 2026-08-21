const express = require('express');
const cors = require('cors');

const { router: authRouter } = require('./routes/auth.routes');
const { router: profileRouter } = require('./routes/profile.routes');
const { errorMiddleware } = require('./middlewares/error.middleware');

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Auth API is running');
});

app.use(authRouter);
app.use(profileRouter);

app.use((req, res) => {
  res.status(404).send({
    message: 'Page not found',
  });
});

app.use(errorMiddleware);

module.exports = {
  app,
};

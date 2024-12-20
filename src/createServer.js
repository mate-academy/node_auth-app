const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { errorMiddleware } = require('./middlewares/errorMiddleware');
const { authRouter } = require('./routes/auth.route');
const { usersRouter } = require('./routes/users.route');

function createServer() {
  const app = express();

  /* CORS  */
  const options = {
    origin: true,
    methods: 'GET, POST, PUT, DELETE, PATCH',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept',
    credentials: true,
  };

  app.use(cors(options), cookieParser(), express.json());

  /* ROUTES */
  app.use('/auth', authRouter);
  app.use('/users', usersRouter);

  app.use(errorMiddleware);

  return app;
}

module.exports = {
  createServer,
};

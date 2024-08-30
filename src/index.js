const express = require('express');
const { authRouter } = require('./routes/auth.route');
const { errorsHandler } = require('./middlewares/errorsHandler');

require('dotenv/config');

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());

app.use('/auth', authRouter);

app.use(errorsHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running');
});

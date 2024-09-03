const express = require('express');
const cookieParser = require('cookie-parser');

const { authRouter } = require('./routes/auth.route');
const { resetRouter } = require('./routes/reset.route');
const { profileRouter } = require('./routes/profile.route');

const { errorMiddleware } = require('./middlewares/error.middleware');

require('dotenv/config');

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/reset', resetRouter);
app.use('/profile', profileRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running');
});

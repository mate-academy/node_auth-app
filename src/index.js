'use strict';

require('dotenv/config');

const express = require('express');
const cookieParser = require('cookie-parser');
const { authRouter } = require('./routes/auth.route.js');
const { profileRouter } = require('./routes/profile.route.js');
const { authMiddleware } = require('./middlewares/authMiddleware.js');
const { errorMiddleware } = require('./middlewares/errorMiddleware.js');

const PORT = process.env.PORT || 3005;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(authRouter);
app.use('/profile', authMiddleware, profileRouter);
app.use(errorMiddleware);

app.listen(PORT, () => {});

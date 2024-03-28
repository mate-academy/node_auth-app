'use strict';

require('dotenv/config');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { initRoutes } = require('./routes/routes.js');
const { errorMiddleware } = require('./libs/middlewares/middlewares.js');

const PORT = process.env.PORT || 5001;
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

initRoutes(app);

app.use(errorMiddleware);

app.listen(PORT);

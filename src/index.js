/* eslint-disable max-len */
/* eslint-disable no-console */
'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const { sequelize } = require('../src/config/database'); // import connect to database
const { router: authRouter } = require('../src/routes/auth.routes');
const { router: userRouter } = require('../src/routes/user.routes'); // import routes

async function start() {
  try {
    await sequelize.authenticate(); // connect to database
    console.log('database connected');

    await sequelize.sync({ alter: true }); // create tables
    console.log('tables created');

    const app = express(); // create express app

    app.use(cookieParser());
    app.use(express.json());

    app.use(authRouter);
    app.use(userRouter);

    // 404 handler
    app.use((req, res) => {
      res.status(404).send('Page not found');
    });

    app.listen(3000, () => console.log('server running on 3000 port')); // start server
  } catch (err) {
    console.error('unable connect to database', err);
  }
}

start();

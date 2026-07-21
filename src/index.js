'use strict';

const closeWithGrace = require('close-with-grace');
const createServer = require('./server');
const { sequelize } = require('./config/db');

const app = createServer();

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

/** @type {import('close-with-grace').CloseWithGraceCallback} */
const cleanUp = async ({ err, signal }, done) => {
  if (err) {
    console.error('Closing server with error', err);
  } else {
    console.log(`${signal} received, closing server`);
  }

  server.close(async () => {
    await sequelize.close();
    console.log('Server isclosed');
    done();
  });
};

closeWithGrace({ delay: 1000 }, cleanUp);

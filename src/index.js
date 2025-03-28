/* eslint-disable no-console */
'use strict';
import closeWithGrace from 'close-with-grace';
import { createApp } from './utils/app.js';
import { db } from './utils/db.js';

const PORT = process.env.PORT || 3000;
const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

const cb = ({ err, signal }, done) => {
  if (err) {
    console.error('Closing server with error', err);
  } else {
    console.log(`${signal} received, closing server`);
  }

  server.close(async () => {
    await db.$disconnect();
    console.log('Server is closed');

    done();
  });
};

closeWithGrace({ delay: 10000 }, cb);

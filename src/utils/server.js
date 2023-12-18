/* eslint-disable no-console */
'use strict';

const express = require('express');

const createServer = (PORT) => {
  const app = express();

  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });

  return app;
};

module.exports = {
  createServer,
};

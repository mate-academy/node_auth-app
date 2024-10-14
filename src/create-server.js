'use strict';

import express from 'express';

export const createServer = () => {
  const app = express();

  app.use(express.json());

  return app;
};

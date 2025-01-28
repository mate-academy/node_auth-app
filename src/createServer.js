'use strict';
import express from 'express';
import cors from 'cors';

const app = express();

export const createServer = () => {
  app.use(cors());

  return app;
};

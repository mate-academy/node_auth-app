/* eslint-disable no-console */
'use strict';
import 'dotenv/config';
import { createServer } from './createServer.js';

const PORT = process.env.PORT || 3004;

async function start() {
  try {
    createServer().listen(PORT, () => {
      console.log(`server runing on ${PORT}`);
    });
  } catch {
    console.log('error start server');
  }
}
start();

'use strict';
import { createServer } from './createServer.js';

createServer().listen(5700, () => {
  console.log('server running on localhost:5700');
});

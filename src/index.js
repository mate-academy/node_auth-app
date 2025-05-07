'use strict';

import { createServer } from './createServer.js';

createServer().listen(8080, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running on localhost:8080 ');
});

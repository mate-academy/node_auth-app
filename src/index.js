/* eslint-disable no-console */

import 'dotenv/config';
import { createServer } from './utils/server.js';

const PORT = process.env.PORT || 3001;

createServer().listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`);
});

'use strict';

import 'dotenv/config';
import { app } from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Go to URL: ${process.env.BE_URL}`);
});

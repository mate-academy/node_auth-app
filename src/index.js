'use strict';

const createApp = require('./app');
const { PORT } = require('./config/env');

const app = createApp();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`\n🔐  Auth API listening on http://localhost:${PORT}\n`);
});

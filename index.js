'use strict';

const { createApp } = require('./src/app');

const PORT = process.env.PORT || 3000;
const app = createApp();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Auth app running on http://localhost:${PORT}`);
});

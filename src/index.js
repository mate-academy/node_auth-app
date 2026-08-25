'use strict';

require('dotenv/config');

const { createApp } = require('./app.js');

const PORT = process.env.PORT || 3000;

createApp().listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`);
});

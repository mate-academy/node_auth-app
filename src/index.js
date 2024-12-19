'use strict';
import app from './app.js';
import 'dotenv/config'

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log('server is running');
});

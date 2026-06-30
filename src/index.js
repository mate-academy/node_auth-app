/* eslint-disable no-console */
require('dotenv').config();

const { createServer } = require('./createServer');
const app = createServer();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});

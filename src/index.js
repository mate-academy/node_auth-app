const createServer = require('./createServer.js');

require('dotenv/config');

const PORT = process.env.PORT || 3005;

createServer().listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`server is running at http://localhost:${PORT}`);
});

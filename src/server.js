/* eslint-disable no-console */
const app = require('./app');

const PORT = process.env.PORT || 3000;

// just for dev/test - remove later if needed
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

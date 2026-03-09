/* eslint-disable no-console */
import app from './app.js';

const PORT = 3000;

console.log('Starting server...');

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

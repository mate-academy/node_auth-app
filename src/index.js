/* eslint-disable no-console */
const express = require('express');
const cors = require('cors');

require('dotenv/config');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json({ origin: process.env.CLIENT_URL }));

app.get('/', (req, res) => {
  res.send('hello');
});

app.listen(PORT, () => {
  console.log(`Server run on http://localhost:${PORT}`);
});

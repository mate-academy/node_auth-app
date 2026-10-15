'use strict';

import dotenv from 'dotenv/config';
import express from 'express';

const PORT = process.env.PORT || 3000;

const app = express();

app.get('/', (req, res) => {
  res.send(`Welcome to PORT ${PORT}!`);
})

app.listen(PORT, () => {
  console.log(`Server is rinning on ${PORT}!`);
})

/* eslint-disable no-console */
'use strict';
import dotenv from 'dotenv';
import express from 'express';
import { sequelize } from './config/database.js';
import { router } from './routes/auth.routes.js';
import './models/user.model.js';

dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(router);

app.get('/', (req, res) => {
  res.send('hello');
});

await sequelize.sync();

app.listen(PORT, () => {
  console.log('Server is running!');
});

'use strict';

import express from 'express';
import session from 'express-session';
import 'dotenv/config';
import { authRouter } from './routes/auth.route.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const PORT = process.env.PORT || 3004;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(authRouter);
app.use(express.static(path.join(dirname, 'public')));

app.use((req, res) => {
  const filePath = path.join(dirname, './public', '404.html');
  const html = fs.readFileSync(filePath, 'utf-8');

  res.status(404).send(html);
});

app.listen(PORT, () => {
  // console.log(`Server is running on port ${PORT}`);
});

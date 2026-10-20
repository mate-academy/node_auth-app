import 'dotenv/config';
import express from 'express';
import { sequelize } from './db.js';
import './model/user.model.js';
import * as authController from './controllers/auth.controller.js';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`Welcome to PORT ${PORT}!`);
});

app.post('/registration', authController.register);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to start the server:', error);
    process.exit(1);
  }
};

start();

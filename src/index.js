import 'dotenv/config';
import express from 'express';
import { sequelize } from './db.js';
import './model/user.model.js';
import * as authController from './controllers/auth.controller.js';
import cors from 'cors';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`Welcome to PORT ${PORT}!`);
});

app.post('/registration', authController.register);
app.get('/activate/:activationToken', authController.activate);

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

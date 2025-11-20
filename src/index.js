'use strict';

import { app } from './server.js';
import dotenv from 'dotenv';
import sequelize from './utils/db.js';

dotenv.config();

const PORT = process.env.PORT || 5252;

app.listen(PORT, () => {
  console.log(`servidor rodando em  http://localhost:${PORT}`);
});

sequelize
  .authenticate()
  .then(() => console.log('Banco conectado com sucesso!'))
  .catch((err) => console.error('Erro ao conectar:', err));

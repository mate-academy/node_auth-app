import 'dotenv/config';

import { client } from './src/utills/db.js';
import { User } from './src/models/userModel.js';
import { Token } from './src/models/token.js';

/* client.sync({ force: true }); */

async function setup() {
  try {
    console.log('🔄 Executando sincronização forçada...');
    await client.sync({ force: true });
    console.log(
      '🔥 BANCO DE DADOS RESETADO: Tabela "Users" criada com a coluna "email"!',
    );
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante o setup:', error);
    process.exit(1);
  }
}

setup();

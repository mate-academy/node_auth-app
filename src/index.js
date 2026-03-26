'use strict';

/**
 * Ponto de entrada da aplicação.
 * Inicializa o banco de dados e inicia o servidor Express.
 */
require('dotenv').config();

const { createServer } = require('./createServer');
const { sequelize } = require('./setup');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Sincroniza os modelos com o banco de dados
    // alter: true atualiza as tabelas existentes sem perder dados
    await sequelize.sync({ alter: true });

    // eslint-disable-next-line no-console
    console.log('Banco de dados sincronizado com sucesso');

    const app = createServer();

    const server = app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });

    // Tratamento de erros do servidor HTTP (ex: porta em uso)
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // eslint-disable-next-line no-console
        console.error(`\n❌ ERRO FATAL: A porta ${PORT} já está em uso!`);

        // eslint-disable-next-line no-console
        console.error(
          `Isso significa que você tem outro servidor Node rodando no fundo (em outro terminal ou travado). Feche-o antes de iniciar novamente.\n`,
        );
        process.exit(1);
      } else {
        // eslint-disable-next-line no-console
        console.error('Erro no servidor HTTP:', err);
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erro ao iniciar o servidor:', error.message);
    process.exit(1);
  }
}

start();

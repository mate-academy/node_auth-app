'use strict';

const { sequelize } = require('./config/database.js');
const { routesController } = require('./routes/routesController.js');

sequelize
  .sync()
  .then(() => {
    routesController().listen(3003, () => {
      // console.log(`rodando na porta 3003 http://localhost:3003`);
    });
  })
  .catch(() => {
    // console.error('server falied connection DB', error);
  });

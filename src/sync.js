import sequelize from './configs/sequelize.config.js';

const sync = async () => {
  try {
    await sequelize.sync({
      // force: true,
    });
  } catch (error) {
    process.exit(1);
  }
};

sync();

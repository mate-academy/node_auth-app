import asyncError from './asyncError.config.js';
import cors from './cors.config.js';
import transporter from './mailer.config.js';
import sequelize from './sequelize.config.js';

const configs = {
  asyncError,
  sequelize,
  transporter,
  cors,
};

export default configs;

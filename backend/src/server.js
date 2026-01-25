import app from './index.js';
import { sequelize } from './models/index.js';

sequelize.sync().then(() => {
  // eslint-disable-next-line no-console
  app.listen(3000, () => console.log('Server running'));
});

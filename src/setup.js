import { Token } from './models/Token.model.js';
import { User } from './models/User.model.js';

async function setup() {
  try {
    await User.sync({ force: true });
    await Token.sync({ force: true });

    console.log('Tables synced!');
  } catch (err) {
    console.error('Error syncing:', err);
  }
}

setup();

import dotenv from 'dotenv/config';
import { User } from './src/models/user.js'
import { Token } from './src/models/token.js'
import { client } from './src/utils/db.js';


async function setup() {
  try {
    await client.sync({ force: true });
  } catch (error) {
    console.error(error);
  }
}

setup();

import { client } from "./src/utils/db.js";
import { User } from "./src/models/user.js";
import { Token } from "./src/models/token.js";
import 'dotenv/config';

try {
  await client.sync({ force: true });
  console.log('DB has been initialized');
} catch (error) {
  console.error('Can not initialize DB', error);
}

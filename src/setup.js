import 'dotenv/config';
import { User } from './models/user.model.js';
import { Token } from './models/token.model.js';

await User.sync({ force: true });
await Token.sync({ force: true });

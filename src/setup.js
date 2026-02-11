import { User } from './models/userModel.js';
import { Token } from './models/tokenModel.js';

User.sync({ force: false });
Token.sync({ force: false });


import 'dotenv/config';

const { User } = require('./models/User.js');

User.sync({ force: true });

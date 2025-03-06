const { sequilize } = require('./utils/db');

require('./models/user.model');
require('./models/token.model');

sequilize.sync({ force: true });

'use strict';
require('dotenv/config');

const { errorMiddleware } = require('./middlewares/error.middleware.js');
const { authRoute } = require('./routes/auth.router.js');
const { userRoute } = require('./routes/user.route.js');
const { createServer } = require('./utils/server.js');

const PORT = process.env.PORT;
const app = createServer(PORT);

app.use(authRoute);
app.use(userRoute);
app.use(errorMiddleware);

require('dotenv').config();

const express = require('express');
const fs = require('fs');
const https = require('https');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { errorMiddleware } = require('./middlewares/errorMiddleware');
const { authRouter } = require('./routes/auth.route');
const { userRouter } = require('./routes/user.route');

const PORT = process.env.PORT || 3005;
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(authRouter);
app.use(userRouter);

app.get('/', (req, res) => {
  res.send('Hello');
});

app.use((req, res, next) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

app.use(errorMiddleware);

const options = {
  key: fs.readFileSync('./certs/server.key'),
  cert: fs.readFileSync('./certs/server.cert'),
};

https.createServer(options, app).listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`HTTPS server running on https://localhost:${PORT}`);
});

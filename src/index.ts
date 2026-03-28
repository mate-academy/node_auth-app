import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { authRouter } from './routes/authRoutes.js';
import { userRouter } from './routes/userRoutes.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { ApiError } from './exceptions/ApiError.js';

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', (request, response) => {
  response.send('Server is runnig;');
});

app.use('/auth', authRouter);
app.use('/user', userRouter);

app.use((req, res, next) => {
  next(ApiError.NotFound());
});

const PORT = process.env.PORT || 3005;

app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(
    `\x1b[32m[READY]\x1b[0m Server is running on \x1b[36mhttp://localhost:${PORT}\x1b[0m`,
  );
});

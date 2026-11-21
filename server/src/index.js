import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { authRoute } from './routes/auth.route.js';
import { userRoute } from './routes/user.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cookiePareser from 'cookie-parser';

const app = express();

const PORT = process.env.PORT || 3005;

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookiePareser());

app.use(authRoute);
app.use('/users', userRoute);
app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running http://localhost:${PORT}`);
});

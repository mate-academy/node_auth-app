import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { authRoute } from './routes/auth.route.js';
import { userRoute } from './routes/user.route.js';

const app = express();

const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

app.use(authRoute);
app.use('/users', userRoute);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running http://localhost:${PORT}`);
});

import express from 'express';
import 'dotenv/config';
import { authRouter } from './routes/auth.router.js';

const PORT = process.env.PORT || 3004;
const app = express();

app.use(express.json());

app.use(authRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`);
});

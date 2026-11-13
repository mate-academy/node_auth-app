import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { authRoute } from './routes/auth.route.js';

const app = express();

const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

app.use(authRoute);

app.get('/', (req, res) => {
  res.send('Hello world');
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running http://localhost:${PORT}`);
});

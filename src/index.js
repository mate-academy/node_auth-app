import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.route.js';
import { activationRouter } from './routes/activation.route.js';
import { profileRouter } from './routes/profile.route.js';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_HOST,
  credentials: true,
}));

app.use(authRouter);
app.use(activationRouter);
app.use(profileRouter);

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

import 'dotenv/config';
import express, { json } from 'express';
import mongoose from 'mongoose';
import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';

const app = express();

app.use(json());

app.use(authRoute);
app.use(userRoute);

app.use((_req, res) => {
  res.status(404).send('Not Found');
});

app.use((err, _req, res) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong');
});

await mongoose.connect(process.env.MONGODB_URI);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});

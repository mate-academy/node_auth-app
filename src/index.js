import express from 'express';
import session from 'express-session';
import { authRouter } from './routes/auth.route.js';
import { activationRouter } from './routes/activation.route.js';
import { profileRouter } from './routes/profile.route.js';
import { client } from './utils/db.js';

const app = express();

app.use(express.json());
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
}));

app.use(authRouter);
app.use(activationRouter);
app.use(profileRouter);

app.listen('3005', () => {
  console.log(`Server running on http://localhost:3005}`);
});

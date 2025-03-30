import cors from 'cors';
import 'dotenv/config';

export default cors({
  origin: `http://localhost:${process.env.PORT}`,
  credentials: true,
});

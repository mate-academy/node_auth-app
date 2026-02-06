import { parseBody } from './bodyParser.ts';
import errorHandler from './errorHandler.ts';
import tokenAuth from './tokenAuth.ts';

const mw = {
  parseB: parseBody,
  error: errorHandler,
  tokenAuth: tokenAuth,
};

export default mw;

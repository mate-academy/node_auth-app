import jwt from 'jsonwebtoken';
import { RequestError } from '../errors/index.ts';
import { httpStatus, TKN, TOKEN_EXPIRY } from '../static/index.ts';
import type { DTOUser, Tokens } from '../static/types/index.ts';

const SECRET_KEY = process.env.JWT_SECRET || '7>?~!id(#;fd13/^^$fdkq124<';

type Signed = { expiresAt: string; token: string };

function signToken(payload: DTOUser, type: Tokens): Signed {
  const expiryDuration = TOKEN_EXPIRY[type][0];
  const expirySeconds = Number(TOKEN_EXPIRY[type][1]);

  const token = jwt.sign({ ...payload, type }, SECRET_KEY, {
    expiresIn: expiryDuration,
  } as jwt.SignOptions);

  const expiresAt = new Date(Date.now() + expirySeconds * 1000).toISOString();

  return { expiresAt, token };
}

function verifyToken(token: string): DTOUser & { type: Tokens } {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as DTOUser & {
      type: Tokens;
    };

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new RequestError('Token has expired', httpStatus.ua);
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new RequestError('Invalid token', httpStatus.br);
    }

    throw new RequestError('Token verification failed', httpStatus.br);
  }
}

const jwtAction = {
  sign: (pl: DTOUser, tp: Tokens) => signToken(pl, tp),
  ver: (tk: string) => verifyToken(tk),
  create: {
    [TKN.ACC]: (payload: DTOUser): Signed => signToken(payload, TKN.ACC),
    [TKN.RFR]: (payload: DTOUser): Signed => signToken(payload, TKN.RFR),
  },
};

export default jwtAction;

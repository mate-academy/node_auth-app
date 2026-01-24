import Token from '../models/Token.js';
import { v4 as uuid } from 'uuid';

export async function createToken(userId, type, minutes = 30) {
  return Token.create({
    user_id: userId,
    token: uuid(),
    type,
    expires_at: new Date(Date.now() + minutes * 60000),
  });
}

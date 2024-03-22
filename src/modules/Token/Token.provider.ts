import type { Provider } from '../../core/modules/Provider/Provider.js';
import Token from './Token.model.js';
import TokenService from './Token.service.js';

export default class TokenProvider implements Provider<TokenService> {
  public service;

  constructor() {
    this.service = new TokenService(Token);
  }
}

import type { Provider } from '../../core/modules/Provider/Provider.js';
import { redisClient } from '../../services/cache.js';
import CacheService from './Cache.service.js';

export default class CacheProvider implements Provider<CacheService> {
  public service = new CacheService(redisClient);
}

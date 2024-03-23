import { redisClient } from '../../services/cache.js';
import sequelize from '../../services/database.js';
import transporter from '../../services/mailer.js';
import ApiError from '../modules/exceptions/ApiError.js';

export default class RootService {
  private checkConnection<T>(verifyPromise: Promise<T>, serviceName: string) {
    return verifyPromise.catch((error: Error) => {
      const errorMessage = `Unable to connect to the ${serviceName}: ${error.message}`;

      throw ApiError.ServerError(errorMessage, { cause: error });
    });
  }

  public async start() {
    await this.checkConnection(redisClient.connect(), 'cache');
    await this.checkConnection(sequelize.authenticate(), 'database');
    await this.checkConnection(transporter.verify(), 'mailer');
  }
}

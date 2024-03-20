/* eslint-disable no-console */
import sequelize from '../services/database.js';
import transporter from '../services/mailer.js';

export default class RootService {
  private checkConnection<T>(verifyPromise: Promise<T>, serviceName: string) {
    return verifyPromise.catch((error: Error) => {
      const errorMessage = `Unable to connect to the ${serviceName}: ${error.message}`;

      throw new Error(errorMessage);
    });
  }

  public async start() {
    await this.checkConnection(sequelize.authenticate(), 'database');
    await this.checkConnection(transporter.verify(), 'mailer');
  }
}

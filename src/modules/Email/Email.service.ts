import type { TransporterType } from '../../services/mailer.js';
import { getActivationEmail } from './Email.helpers.js';
import retry from 'async-await-retry';

export default class EmailService {
  constructor(private readonly transporter: TransporterType) {}

  private getActivationLink(token: string) {
    const { HOST, PORT } = process.env;
    const host = HOST ?? 'localhost';
    const port = PORT ?? 3000;

    return `http://${host}:${port}/activate?token=${token}`;
  }

  async sendActivationEmail(email: string, token: string) {
    const html = getActivationEmail(this.getActivationLink(token));
    const sendMail = () => this.transporter.sendMail({ to: email, html });

    const messageInfo = await retry(sendMail, [], {
      retriesMax: 4,
      factor: 1.5,
      interval: 10000,
    });

    return messageInfo;
  }
}

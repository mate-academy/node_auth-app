import type Mail from 'nodemailer/lib/mailer/index.js';
import type { TransporterType } from '../../services/mailer.js';
import { AuthRoutes } from '../Auth/Auth.routes.js';
import { getActivationEmail } from './Email.helpers.js';
import retry from 'p-retry';

export default class EmailService {
  constructor(private readonly transporter: TransporterType) {}

  private getActivationLink(token: string, redirectFromUser?: string) {
    const { HOST, PORT, ACTIVATION_REDIRECT_URL } = process.env;
    const host = HOST ?? 'localhost';
    const port = PORT ?? 3000;
    const redirect = redirectFromUser ?? ACTIVATION_REDIRECT_URL ?? '';

    return `http://${host}:${port}${AuthRoutes.ACTIVATE}?token=${token}&redirect=${redirect}`;
  }

  public send(options: Mail.Options) {
    return this.transporter.sendMail(options);
  }

  async sendActivationEmail(email: string, token: string, redirect?: string) {
    const html = getActivationEmail(this.getActivationLink(token, redirect));
    const sendMail = () => this.transporter.sendMail({ to: email, html });

    const messageInfo = await retry(sendMail, {
      retries: 4,
      factor: 1.5,
      minTimeout: 10000,
    });

    return messageInfo;
  }
}

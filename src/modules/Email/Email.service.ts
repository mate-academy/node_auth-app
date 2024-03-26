import type Mail from 'nodemailer/lib/mailer/index.js';
import retry, { type Options as RetryOptions } from 'p-retry';
import type { TransporterType } from '../../services/mailer.js';
import { AuthRoutes } from '../Auth/Auth.routes.js';
import {
  getActivationEmail,
  getPasswordChangedEmail,
  getPasswordResetEmail,
} from './Email.helpers.js';
import { isServerRedirect, type ConfirmationEmailOptions } from './Email.types.js';
import ApiError from '../../core/modules/exceptions/ApiError.js';

export default class EmailService {
  private readonly baseUrl = `http://${process.env.HOST ?? 'localhost'}:${process.env.PORT ?? 3000}`;

  constructor(private readonly transporter: TransporterType) {}

  public sendConfirmationEmail(options: ConfirmationEmailOptions) {
    const { email, token, getHTML } = options;
    const confirmationLink = isServerRedirect(options)
      ? `${this.baseUrl}${options.route}?token=${token}&redirect=${options.redirect}`
      : `${options.baseUrl}?token=${token}`;

    const html = getHTML(confirmationLink);

    return this.send({ to: email, html }).catch((err) => {
      throw ApiError.ServerError(`Unable to send email confirmation to ${email}`, {
        cause: err,
        payload: { email, confirmationLink, options },
      });
    });
  }

  public send(options: Mail.Options, retryOptions?: RetryOptions) {
    return retry(() => this.transporter.sendMail(options), {
      retries: 4,
      factor: 1.5,
      minTimeout: 10000,
      ...retryOptions,
    });
  }

  async sendActivationEmail(email: string, token: string, redirectFromClient?: string) {
    return this.sendConfirmationEmail({
      email,
      token,
      route: AuthRoutes.ACTIVATE,
      getHTML: getActivationEmail,
      redirect: redirectFromClient ?? process.env.ACTIVATION_REDIRECT_URL,
    });
  }

  async sendResetPasswordEmail(email: string, token: string, baseUrl: string) {
    return this.sendConfirmationEmail({
      email,
      token,
      baseUrl,
      getHTML: getPasswordResetEmail,
    });
  }

  async sendPasswordChangedEmail(email: string) {
    return this.send({
      to: email,
      html: getPasswordChangedEmail(),
    });
  }
}

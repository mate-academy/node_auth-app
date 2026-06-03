import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;
  private readonly senderEmail: string;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const senderEmail = process.env.SMTP_FROM ?? user;

    if (!host || !port || !user || !pass || !senderEmail) {
      throw new Error(
        'SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and SMTP_FROM (optional) must be configured',
      );
    }

    this.senderEmail = senderEmail;
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  async sendActivationEmail(email: string, activationLink: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.senderEmail,
        to: email,
        subject: 'Activate your account',
        html: `
          <p>Please activate your account by clicking the button below:</p>
          <p>
            <a href="${activationLink}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;">
              Activate account
            </a>
          </p>
          <p>If the button does not work, copy this URL:</p>
          <p>${activationLink}</p>
        `,
      });
    } catch (error) {
      this.logger.error(`Failed to send activation email to ${email}`, error);
      throw new InternalServerErrorException('Failed to send activation email');
    }
  }

  async sendActivationChangeEmail(email: string, activationLink: string): Promise<void> {
    try {
      const res = await this.transporter.sendMail({
        from: this.senderEmail,
        to: email,
        subject: 'Activate your email',
        html: `
          <p>Please activate your new email by clicking the button below:</p>
          <p>
            <a href="${activationLink}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;">
              Activate new email
            </a>
          </p>
          <p>If the button does not work, copy this URL:</p>
          <p>${activationLink}</p>
        `,
      });
    } catch (error) {
      this.logger.error(`Failed to send activation email to ${email}`, error);
      throw new InternalServerErrorException('Failed to send activation email');
    }
  }
  async sendChangeEmailNotify(email: string): Promise<void> {
    try {
      const res = await this.transporter.sendMail({
        from: this.senderEmail,
        to: email,
        subject: 'Email Address Changed',
        html: `
          <p>
            Your account email address has been changed successfully.

            If this was not you, please contact support immediately and change your password.

            Best regards,
            The Support Team
          </p>
        `,
      });
    } catch (error) {
      this.logger.error(`Failed to send activation email to ${email}`, error);
      throw new InternalServerErrorException('Failed to send activation email');
    }
  }
  async sendActivationResetPassword(email: string, resetLink: string): Promise<void> {
    try {
      const res = await this.transporter.sendMail({
        from: this.senderEmail,
        to: email,
        subject: 'Reset password',
        html: `
        <p>Click the link below to reset your password:</p>
          <p>
            <a href="${resetLink}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;">
              Reset password
            </a>
          </p>
          <p>If the button does not work, copy this URL:</p>
          <p>${resetLink}</p>
        `,
      });
    } catch (error) {
      this.logger.error(`Failed to send activation email to ${email}`, error);
      throw new InternalServerErrorException('Failed to send activation email');
    }
  }
}

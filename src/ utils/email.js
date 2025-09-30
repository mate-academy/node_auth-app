import nodemailer from 'nodemailer';
import pug from 'pug';
import { htmlToText } from 'html-to-text';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory path (ESM compatible)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name?.split(' ')[0] || 'User';
    this.url = url;
    this.from = `Eco Cosmetics <${process.env.EMAIL_FROM}>`;
  }

  // Create transport configuration
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // SendGrid for production
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    // Mailtrap for development (fallback to SMTP)
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: process.env.EMAIL_PORT || 2525,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Additional security for production-like environments
      secure: process.env.NODE_ENV !== 'development',
      tls: {
        rejectUnauthorized: process.env.NODE_ENV !== 'development',
      },
    });
  }

  // Send the actual email
  async send(template, subject, templateVars = {}) {
    try {
      // 1) Render HTML based on a pug template
      const html = pug.renderFile(
        path.join(dirName, `../views/emails/${template}.pug`),
        {
          firstName: this.firstName,
          url: this.url,
          subject,
          ...templateVars, // Additional template variables
        },
      );

      // 2) Define email options
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: htmlToText(html),
        // Add DKIM signing if available
        dkim: process.env.DKIM_PRIVATE_KEY
          ? {
              domainName: process.env.DOMAIN,
              keySelector: process.env.DKIM_SELECTOR || 'default',
              privateKey: process.env.DKIM_PRIVATE_KEY,
            }
          : undefined,
      };

      // 3) Create transport and send email
      const transport = this.newTransport();

      await transport.sendMail(mailOptions);

      // Log success in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Email sent to ${this.to}`);
      }
    } catch (err) {
      console.error(`Error sending ${template} email:`, err);
      throw new Error(`Failed to send ${template} email`);
    }
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Eco Cosmetics!', {
      preheader: 'Thanks for joining our community',
    });
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for 10 minutes)',
      { expiresIn: '10 minutes' },
    );
  }

  async sendActivation() {
    await this.send(
      'accountActivation',
      'Activate your account (valid for 24 hours)',
      { expiresIn: '24 hours' },
    );
  }

  async sendEmailChangeNotification(oldEmail) {
    await this.send('emailChange', 'Your email has been changed', {
      oldEmail,
      newEmail: this.to,
    });
  }
}

// Utility function for simple email sending
const sendEmail = async (options) => {
  try {
    // Validate required options
    if (
      !options.email ||
      !options.subject ||
      (!options.message && !options.html)
    ) {
      throw new Error('Missing required email options');
    }

    // Create transporter with fallbacks
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: process.env.EMAIL_PORT || 2525,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      secure: process.env.NODE_ENV !== 'development',
    });

    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Eco Cosmetics <hello@ecocosmetics.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
      // Add reply-to if specified
      replyTo: options.replyTo || process.env.EMAIL_REPLY_TO,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // Return message ID for tracking
    return { messageId: info.messageId };
  } catch (err) {
    console.error('Error sending email:', err);
    throw new Error(
      'There was an error sending the email. Please try again later.',
    );
  }
};

export { Email, sendEmail };

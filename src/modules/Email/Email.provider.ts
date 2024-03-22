import type { Provider } from '../../core/modules/Provider/Provider.js';
import transporter from '../../services/mailer.js';
import EmailService from './Email.service.js';

export default class EmailProvider implements Provider<EmailService> {
  public service = new EmailService(transporter);
}

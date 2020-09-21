import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import * as fs from 'fs';

@Injectable()
class EmailService {
  private readonly transporter: Mail;

  constructor() {
    this.transporter = createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmailAsync(
    receiver: string,
    subject: string,
    username: string,
    message: string,
  ): Promise<void> {
    this.transporter.sendMail({
      from: process.env.EMAIL,
      to: receiver,
      subject,
      html: this.getHtml(username, message),
    });
  }

  private getHtml(username: string, message: string): string {
    let html = fs.readFileSync('./shared/email-recovery-code-template.html', { encoding: 'utf8' });
    html = html
      .replace('{username}', username)
      .replace('{message}', message);
    return html;
  }
}

export default EmailService;

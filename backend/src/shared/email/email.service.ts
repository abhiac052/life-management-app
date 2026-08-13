import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.from = this.config.get<string>('email.from') ?? 'noreply@app.com';
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('email.host'),
      port: this.config.get<number>('email.port'),
      auth: {
        user: this.config.get<string>('email.user'),
        pass: this.config.get<string>('email.pass'),
      },
    });
  }

  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: 'Reset your password',
        html: `<p>Click the link below to reset your password. It expires in 1 hour.</p>
               <p><a href="${resetUrl}">${resetUrl}</a></p>
               <p>If you did not request this, ignore this email.</p>`,
      });
    } catch (err) {
      this.logger.error(`Failed to send password reset email to ${to}`, err);
    }
  }
}

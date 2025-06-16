import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from '../dto/email.dto';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class SmsService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('email.host'),
      port: this.configService.get<number>('email.port'),
      secure: false,
      auth: {
        user: this.configService.get<string>('email.auth.user'),
        pass: this.configService.get<string>('email.auth.pass'),
      },
    });
  }

  async sendEmail(
    sendEmailDto: SendEmailDto,
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('email.auth.user'),
        to: sendEmailDto.to,
        subject: sendEmailDto.subject,
        ...(sendEmailDto.format === 'html'
          ? { html: sendEmailDto.message }
          : { text: sendEmailDto.message }),
      };

      const result = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to send email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(
    to: string,
    name: string,
  ): Promise<{ success: boolean; messageId?: string }> {
    const template = this.getWelcomeTemplate(name);

    return this.sendEmail({
      to,
      subject: template.subject,
      message: template.html,
      format: 'html',
    });
  }

  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
  ): Promise<{ success: boolean; messageId?: string }> {
    const template = this.getPasswordResetTemplate(resetToken);

    return this.sendEmail({
      to,
      subject: template.subject,
      message: template.html,
      format: 'html',
    });
  }

  async sendScamAlertEmail(
    to: string,
    scamDetails: any,
  ): Promise<{ success: boolean; messageId?: string }> {
    const template = this.getScamAlertTemplate(scamDetails);

    return this.sendEmail({
      to,
      subject: template.subject,
      message: template.html,
      format: 'html',
    });
  }

  async sendBulkEmail(
    recipients: string[],
    subject: string,
    message: string,
    format: 'text' | 'html' = 'text',
  ): Promise<{ success: boolean; results: any[] }> {
    const results: Array<{
      email: string;
      success: boolean;
      messageId?: string;
      error?: any;
    }> = [];

    for (const recipient of recipients) {
      try {
        const result = await this.sendEmail({
          to: recipient,
          subject,
          message,
          format,
        });
        results.push({ email: recipient, ...result });
      } catch (error: any) {
        results.push({
          email: recipient,
          success: false,
          error: error.message,
        });
      }
    }

    return {
      success: true,
      results,
    };
  }

  async verifyEmailConfiguration(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error: any) {
      console.error('Email configuration verification failed:', error);
      return false;
    }
  }

  private getWelcomeTemplate(name: string): EmailTemplate {
    return {
      subject: 'Welcome to Ndimboni - Digital Scam Protection Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2980B9;">Welcome to Ndimboni!</h1>
          <p>Dear ${name},</p>
          <p>Thank you for joining Ndimboni, Rwanda's premier digital scam protection platform.</p>
          <p>Our platform will help you:</p>
          <ul>
            <li>Detect and report digital scams</li>
            <li>Stay informed about latest scam threats</li>
            <li>Protect yourself and your community</li>
          </ul>
          <p>Get started by exploring our platform and reporting any suspicious activities.</p>
          <p>Best regards,<br>The Ndimboni Team</p>
        </div>
      `,
      text: `Welcome to Ndimboni!\n\nDear ${name},\n\nThank you for joining Ndimboni, Rwanda's premier digital scam protection platform.\n\nBest regards,\nThe Ndimboni Team`,
    };
  }

  private getPasswordResetTemplate(resetToken: string): EmailTemplate {
    const resetLink = `${this.configService.get<string>('cors.origin')}/reset-password?token=${resetToken}`;

    return {
      subject: 'Password Reset - Ndimboni',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2980B9;">Password Reset Request</h1>
          <p>You have requested to reset your password for your Ndimboni account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}" style="background-color: #2980B9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this reset, please ignore this email.</p>
        </div>
      `,
      text: `Password Reset Request\n\nYou have requested to reset your password.\n\nReset link: ${resetLink}\n\nThis link will expire in 1 hour.`,
    };
  }

  private getScamAlertTemplate(scamDetails: any): EmailTemplate {
    return {
      subject: '⚠️ Scam Alert - Ndimboni',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e74c3c;">⚠️ Scam Alert</h1>
          <p>A new scam has been reported and verified on our platform.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #e74c3c;">
            <h3>Scam Details:</h3>
            <p><strong>Type:</strong> ${scamDetails.type || 'Unknown'}</p>
            <p><strong>Description:</strong> ${scamDetails.description || 'No description available'}</p>
            <p><strong>Reported Date:</strong> ${scamDetails.reportedDate || new Date().toLocaleDateString()}</p>
          </div>
          <p>Please be cautious and share this information with your network.</p>
          <p>Stay safe,<br>The Ndimboni Team</p>
        </div>
      `,
      text: `⚠️ Scam Alert\n\nA new scam has been reported:\nType: ${scamDetails.type || 'Unknown'}\nDescription: ${scamDetails.description || 'No description available'}\n\nStay safe,\nThe Ndimboni Team`,
    };
  }
}

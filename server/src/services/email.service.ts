import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import config from '../config/env';

class EmailService {
  private sesClient: SESClient;

  constructor() {
    this.sesClient = new SESClient({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });
  }

  async sendOTP(email: string, otpCode: string, purpose: 'login' | 'signup'): Promise<boolean> {
    try {
      const subject = purpose === 'login' 
        ? 'ServiceTime - Your Login Code'
        : 'ServiceTime - Welcome! Verify Your Email';

      const htmlBody = this.generateOTPEmailHTML(otpCode, purpose);
      const textBody = this.generateOTPEmailText(otpCode, purpose);

      const command = new SendEmailCommand({
        Source: `${config.ses.fromName} <${config.ses.fromEmail}>`,
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: htmlBody,
              Charset: 'UTF-8',
            },
            Text: {
              Data: textBody,
              Charset: 'UTF-8',
            },
          },
        },
      });

      await this.sesClient.send(command);
      console.log(`✅ OTP email sent successfully to ${email}`);
      return true;

    } catch (error) {
      console.error('❌ Failed to send OTP email:', error);
      return false;
    }
  }

  private generateOTPEmailHTML(otpCode: string, purpose: 'login' | 'signup'): string {
    const title = purpose === 'login' ? 'Sign In to ServiceTime' : 'Welcome to ServiceTime!';
    const message = purpose === 'login' 
      ? 'Use this code to sign in to your ServiceTime account:'
      : 'Use this code to complete your account setup:';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 20px; }
          .otp-box { background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
          .otp-code { font-size: 36px; font-weight: 700; color: #1e293b; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
          .button { display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 ServiceTime</h1>
          </div>
          <div class="content">
            <h2 style="color: #1e293b; margin-bottom: 20px;">${title}</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">${message}</p>
            
            <div class="otp-box">
              <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">Your verification code:</p>
              <div class="otp-code">${otpCode}</div>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
              This code will expire in <strong>10 minutes</strong>. If you didn't request this code, please ignore this email.
            </p>
            
            ${purpose === 'signup' ? `
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                Welcome to ServiceTime! We're excited to help you manage your service business more efficiently.
              </p>
            ` : ''}
          </div>
          <div class="footer">
            <p>© 2025 ServiceTime. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOTPEmailText(otpCode: string, purpose: 'login' | 'signup'): string {
    const title = purpose === 'login' ? 'Sign In to ServiceTime' : 'Welcome to ServiceTime!';
    const message = purpose === 'login' 
      ? 'Use this code to sign in to your ServiceTime account:'
      : 'Use this code to complete your account setup:';

    return `
${title}

${message}

Your verification code: ${otpCode}

This code will expire in 10 minutes. If you didn't request this code, please ignore this email.

${purpose === 'signup' ? 'Welcome to ServiceTime! We\'re excited to help you manage your service business more efficiently.' : ''}

© 2025 ServiceTime. All rights reserved.
This is an automated message, please do not reply to this email.
    `;
  }
}

export const emailService = new EmailService();

import * as nodemailer from 'nodemailer';
import { Attachment } from 'nodemailer/lib/mailer';

export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
  attachments?: Attachment[];
}

function createTransporter(port: number, secure: boolean) {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtpout.secureserver.net',
    port: port,
    secure: secure,
    auth: {
      user: process.env.EMAIL_USER || 'support@annecreationshb.com',
      pass: process.env.EMAIL_PASSWORD || 'Anne$@2025',
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
  } as any);
}

export const sendEmail = async (options: EmailOptions) => {
  if (!options.to) return;

  const replacements = {
    companyName: process.env.EMAIL_FROM_NAME || 'Anne Creations Support',
    currentYear: new Date().getFullYear(),
    ...options.data,
  };

  let html = options.template || `
    <!DOCTYPE html>
    <html>
    <body>
      <h2>{{ subject }}</h2>
      <p>{{ message }}</p>
    </body>
    </html>
  `;

  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    html = html.replace(regex, String(value || ''));
  }

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Anne Creations Support'}" <${process.env.EMAIL_FROM || 'support@annecreationshb.com'}>`,
    to: options.to,
    subject: options.subject,
    html,
    attachments: options.attachments || [],
  };

  const configuredPort = Number(process.env.EMAIL_PORT) || 587;
  const configuredSecure = process.env.EMAIL_SECURE === 'true' || configuredPort === 465;

  const transportConfigs = [
    { port: configuredPort, secure: configuredSecure },
    { port: 465, secure: true },
    { port: 587, secure: false },
    { port: 25, secure: false },
  ];

  let lastError: any = null;
  for (const config of transportConfigs) {
    try {
      const transporter = createTransporter(config.port, config.secure);
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email] Sent successfully to ${options.to} via port ${config.port}. MessageId: ${info.messageId}`);
      return info;
    } catch (error) {
      console.warn(`[Email] Transport attempt failed (port ${config.port}):`, error?.message || error);
      lastError = error;
    }
  }

  console.error(`[Email] All transport attempts failed for ${options.to}:`, lastError);
  throw lastError;
};

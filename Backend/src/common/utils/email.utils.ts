import * as nodemailer from 'nodemailer';
import { Attachment } from 'nodemailer/lib/mailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 465,
      secure: process.env.EMAIL_PORT === '465' || !process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      family: 4,
      connectionTimeout: 60000,
    } as any);
  }
  return transporter;
}

export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
  attachments?: Attachment[];
}

export const sendEmail = async (options: EmailOptions) => {
  if (!options.to) return;

  const replacements = {
    companyName: process.env.EMAIL_FROM_NAME || 'Anne Creations',
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
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: options.to,
    subject: options.subject,
    html,
    attachments: options.attachments || [],
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log(`[Email] Sent successfully to ${options.to}. MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Email] Failed to send to ${options.to}:`, error);
    throw error;
  }
};

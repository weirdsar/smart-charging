import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const host = process.env.SMTP_HOST;
const port = parseInt(process.env.SMTP_PORT || '465', 10);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASSWORD ?? process.env.SMTP_PASS;
const from =
  process.env.SMTP_FROM ?? process.env.EMAIL_FROM ?? 'noreply@tts64.ru';

if (!host || !user || !pass) {
  console.warn('⚠️ SMTP credentials not set — email notifications disabled');
}

let transporter: Transporter | null = null;

if (host && user && pass) {
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: string;
  }>;
  /** When set and `attachments` is omitted, attaches B2C/B2B PDF from `public/docs/`. */
  leadMagnetType?: 'B2C' | 'B2B';
}

/**
 * Paths to lead magnet PDFs (auto-reply). Filenames in email match user-facing names.
 */
export function getLeadMagnetAttachments(
  emailType: 'B2C' | 'B2B'
): SendEmailOptions['attachments'] | undefined {
  const slug = emailType.toLowerCase();
  const filePath = path.join(process.cwd(), 'public', 'docs', `lead-magnet-${slug}.pdf`);
  if (!fs.existsSync(filePath)) {
    console.warn(`Lead magnet PDF missing: ${filePath}`);
    return undefined;
  }
  return [
    {
      filename: emailType === 'B2C' ? 'pamyatka.pdf' : 'oprosnik.pdf',
      path: filePath,
    },
  ];
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  if (!transporter) {
    console.warn('Email transporter not configured — skipping email');
    return;
  }

  const attachments =
    options.attachments ??
    (options.leadMagnetType ? getLeadMagnetAttachments(options.leadMagnetType) : undefined);

  try {
    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments,
    });
    console.log(`✅ Email sent to ${options.to}`);
  } catch (error) {
    console.error('❌ Email send failed:', error);
  }
}

function escapeHtmlText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function getAutoReplyHtml(name: string, type: 'B2C' | 'B2B'): string {
  const safeName = escapeHtmlText(name);
  const greeting = `Здравствуйте, ${safeName}!`;
  const thanks =
    type === 'B2C'
      ? 'Спасибо за интерес к нашему оборудованию.'
      : 'Спасибо за запрос коммерческого предложения.';

  const leadMagnet =
    type === 'B2C'
      ? 'Во вложении вы найдёте памятку <b>«5 ошибок при подключении генератора к дому»</b>.'
      : 'Во вложении — бланк опроса для подготовки технического задания.';

  return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .cta { display: inline-block; background: #FF6B00; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Умная Зарядка</h1>
          <p>Официальный дилер TSS и Pandora</p>
        </div>
        <div class="content">
          <p>${greeting}</p>
          <p>${thanks}</p>
          <p>${leadMagnet}</p>
          <p>Наш менеджер свяжется с вами в ближайшее время для уточнения деталей.</p>
          <p>Если у вас срочный вопрос, звоните: <b>+7 (917) 210-06-60</b></p>
          <a href="https://tts64.ru" class="cta">Перейти на сайт</a>
        </div>
        <div class="footer">
          <p>ООО «Умная зарядка»<br>г. Саратов<br>info@tts64.ru</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

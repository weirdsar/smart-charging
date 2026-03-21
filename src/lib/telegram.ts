import { Bot } from 'grammy';

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!botToken) {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN not set — bot notifications disabled');
}

if (!chatId) {
  console.warn('⚠️ TELEGRAM_CHAT_ID not set — bot notifications disabled');
}

const bot = botToken ? new Bot(botToken) : null;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface LeadNotification {
  type: 'CALLBACK' | 'COMMERCIAL_OFFER' | 'LEASING' | 'CONTACT' | 'QUIZ';
  name: string;
  phone: string;
  email?: string;
  message?: string;
  productTitle?: string;
  productUrl?: string;
  sourcePage: string;
  utmData?: Record<string, string>;
}

export async function sendLeadNotification(data: LeadNotification): Promise<void> {
  if (!bot || !chatId) {
    console.warn('Telegram bot not configured — skipping notification');
    return;
  }

  const typeLabels: Record<LeadNotification['type'], string> = {
    CALLBACK: '📞 Заказ звонка',
    COMMERCIAL_OFFER: '📄 Запрос КП',
    LEASING: '💳 Запрос на лизинг',
    CONTACT: '✉️ Обратная связь',
    QUIZ: '🎯 Квиз',
  };

  const lines = [
    `🔔 <b>${typeLabels[data.type]}</b>`,
    '',
    `👤 <b>Имя:</b> ${escapeHtml(data.name)}`,
    `📱 <b>Телефон:</b> <code>${escapeHtml(data.phone)}</code>`,
  ];

  if (data.email) {
    lines.push(`📧 <b>Email:</b> ${escapeHtml(data.email)}`);
  }

  if (data.productTitle) {
    lines.push('', `🔧 <b>Товар:</b> ${escapeHtml(data.productTitle)}`);
    if (data.productUrl) {
      lines.push(`🔗 ${escapeHtml(data.productUrl)}`);
    }
  }

  if (data.message) {
    lines.push('', `💬 <b>Сообщение:</b>`, escapeHtml(data.message));
  }

  lines.push('', `📍 <b>Страница:</b> ${escapeHtml(data.sourcePage)}`);

  if (data.utmData && Object.keys(data.utmData).length > 0) {
    lines.push('', '<b>UTM-метки:</b>');
    Object.entries(data.utmData).forEach(([key, value]) => {
      lines.push(`  • ${escapeHtml(key)}: ${escapeHtml(value)}`);
    });
  }

  const text = lines.join('\n');

  try {
    await bot.api.sendMessage(chatId, text, { parse_mode: 'HTML' });
    console.log('✅ Telegram notification sent');
  } catch (error) {
    console.error('❌ Telegram notification failed:', error);
  }
}

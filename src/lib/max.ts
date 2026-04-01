const maxTokenRaw = process.env.MAX_BOT_TOKEN?.trim();
const maxUserId = process.env.MAX_NOTIFY_USER_ID?.trim();
const maxChatId = process.env.MAX_NOTIFY_CHAT_ID?.trim();

if (!maxTokenRaw) {
  console.warn('⚠️ MAX_BOT_TOKEN not set — MAX notifications disabled');
}

if (!maxUserId && !maxChatId) {
  console.warn('⚠️ MAX_NOTIFY_USER_ID / MAX_NOTIFY_CHAT_ID not set — MAX notifications disabled');
}

const maxToken = maxTokenRaw || null;

function toLines(data: {
  type: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  productTitle?: string;
  productUrl?: string;
  sourcePage: string;
  utmData?: Record<string, string>;
}): string[] {
  const typeLabels: Record<string, string> = {
    CALLBACK: 'Заказ звонка',
    COMMERCIAL_OFFER: 'Запрос КП',
    LEASING: 'Запрос на лизинг',
    CONTACT: 'Обратная связь',
    QUIZ: 'Квиз',
  };

  const lines = [
    `Новая заявка: ${typeLabels[data.type] ?? data.type}`,
    '',
    `Имя: ${data.name}`,
    `Телефон: ${data.phone}`,
  ];

  if (data.email) {
    lines.push(`Email: ${data.email}`);
  }

  if (data.productTitle) {
    lines.push('', `Товар: ${data.productTitle}`);
    if (data.productUrl) {
      lines.push(`Ссылка: ${data.productUrl}`);
    }
  }

  if (data.message) {
    lines.push('', 'Сообщение:', data.message);
  }

  lines.push('', `Страница: ${data.sourcePage}`);

  if (data.utmData && Object.keys(data.utmData).length > 0) {
    lines.push('', 'UTM:');
    for (const [key, value] of Object.entries(data.utmData)) {
      lines.push(`- ${key}: ${value}`);
    }
  }

  return lines;
}

export async function sendMaxLeadNotification(data: {
  type: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  productTitle?: string;
  productUrl?: string;
  sourcePage: string;
  utmData?: Record<string, string>;
}): Promise<void> {
  if (!maxToken) {
    return;
  }

  // Prefer group delivery when both IDs are present.
  const query = maxChatId
    ? `chat_id=${encodeURIComponent(maxChatId)}`
    : `user_id=${encodeURIComponent(maxUserId as string)}`;
  const url = `https://platform-api.max.ru/messages?${query}`;
  const text = toLines(data).join('\n');

  const send = async (authHeader: string): Promise<Response> =>
    fetch(url, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
      cache: 'no-store',
    });

  try {
    let res = await send(maxToken);
    if (res.status === 401 && !maxToken.toLowerCase().startsWith('bearer ')) {
      res = await send(`Bearer ${maxToken}`);
    }

    if (!res.ok) {
      const body = await res.text();
      console.error('MAX notification failed:', res.status, body);
      return;
    }

    console.log('✅ MAX notification sent');
  } catch (error) {
    console.error('MAX notification error:', error);
  }
}

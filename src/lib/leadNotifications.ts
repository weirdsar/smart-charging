import { SITE_URL } from '@/lib/constants';
import { sendEmail, getAutoReplyHtml } from '@/lib/email';
import { sendMaxLeadNotification } from '@/lib/max';
import { sendLeadNotification } from '@/lib/telegram';

type LeadCategoryType = string | null;

export interface LeadNotificationPayload {
  type: 'CALLBACK' | 'COMMERCIAL_OFFER' | 'LEASING' | 'CONTACT' | 'QUIZ';
  name: string;
  phone: string;
  email?: string;
  message?: string;
  productTitle?: string;
  productSlug?: string;
  productCategoryType?: LeadCategoryType;
  sourcePage: string;
  utmData?: Record<string, string>;
}

function getProductUrl(payload: LeadNotificationPayload): string | undefined {
  if (!payload.productTitle || !payload.productSlug) {
    return undefined;
  }

  const categoryPath =
    payload.productCategoryType === 'GENERATORS_PORTABLE'
      ? 'generators/portable'
      : payload.productCategoryType === 'GENERATORS_INDUSTRIAL'
        ? 'generators/industrial'
        : 'charging-stations';

  return `${SITE_URL}/catalog/${categoryPath}/${payload.productSlug}`;
}

export async function sendLeadNotifications(
  payload: LeadNotificationPayload
): Promise<void> {
  const productUrl = getProductUrl(payload);

  const tasks: Array<Promise<unknown>> = [
    sendLeadNotification({
      type: payload.type,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      message: payload.message,
      productTitle: payload.productTitle,
      productUrl,
      sourcePage: payload.sourcePage,
      utmData: payload.utmData,
    }),
    sendMaxLeadNotification({
      type: payload.type,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      message: payload.message,
      productTitle: payload.productTitle,
      productUrl,
      sourcePage: payload.sourcePage,
      utmData: payload.utmData,
    }),
  ];

  if (payload.email && (payload.type === 'COMMERCIAL_OFFER' || payload.type === 'CALLBACK')) {
    const emailType = payload.type === 'COMMERCIAL_OFFER' ? 'B2B' : 'B2C';
    const subject =
      payload.type === 'COMMERCIAL_OFFER' ? 'Ваш запрос получен' : 'Спасибо за обращение';

    tasks.push(
      sendEmail({
        to: payload.email,
        subject,
        html: getAutoReplyHtml(payload.name, emailType),
        leadMagnetType: emailType,
      })
    );
  }

  await Promise.allSettled(tasks);
}

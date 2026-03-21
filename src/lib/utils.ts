import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const RU_TO_LATIN: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

export function slugify(text: string): string {
  const lower = text.trim().toLowerCase();
  let out = '';
  for (const ch of lower) {
    if (RU_TO_LATIN[ch]) {
      out += RU_TO_LATIN[ch];
    } else if (/[a-z0-9]/.test(ch)) {
      out += ch;
    } else if (/\s|-|_|,|\./.test(ch)) {
      out += '-';
    }
  }
  return out.replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  let rest = digits;
  if (rest.startsWith('8') && rest.length === 11) {
    rest = `7${rest.slice(1)}`;
  }
  if (rest.startsWith('7') && rest.length === 11) {
    const a = rest.slice(1, 4);
    const b = rest.slice(4, 7);
    const c = rest.slice(7, 9);
    const d = rest.slice(9, 11);
    return `+7 (${a}) ${b}-${c}-${d}`;
  }
  return phone.trim();
}

/** Normalize Russian mobile numbers to +7XXXXXXXXXX for storage. */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 11 && (digits.startsWith('8') || digits.startsWith('7'))) {
    return `+7${digits.slice(1)}`;
  }
  if (digits.length === 10) {
    return `+7${digits}`;
  }
  if (digits.length >= 11 && digits.startsWith('7')) {
    return `+7${digits.slice(-10)}`;
  }
  if (input.trim().startsWith('+') && digits.length >= 10) {
    return `+${digits}`;
  }
  if (digits.length > 0) {
    return `+7${digits.slice(-10)}`;
  }
  return input.trim();
}

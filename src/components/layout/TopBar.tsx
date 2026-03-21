import { Clock, MapPin, Phone } from 'lucide-react';
import {
  COMPANY_CITY,
  COMPANY_PHONE,
  COMPANY_PHONE_DISPLAY,
  COMPANY_WORKTIME,
} from '@/lib/constants';

export default function TopBar() {
  const telHref = `tel:${COMPANY_PHONE.replace(/\s/g, '')}`;

  return (
    <div className="w-full border-b border-surface-light bg-surface">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
        <div className="flex min-w-0 flex-1 items-center text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {COMPANY_CITY}
          </span>
          <span className="mx-2 hidden text-surface-light md:inline">|</span>
          <span className="hidden items-center gap-1 md:inline-flex">
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {COMPANY_WORKTIME}
          </span>
        </div>
        <a
          href={telHref}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-text-primary transition-colors hover:text-accent"
        >
          <Phone className="h-3.5 w-3.5" aria-hidden />
          {COMPANY_PHONE_DISPLAY}
        </a>
      </div>
    </div>
  );
}

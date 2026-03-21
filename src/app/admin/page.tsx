import StatsCard from '@/components/admin/StatsCard';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { prisma } from '@/lib/prisma';
import { LeadStatus, LeadType } from '@prisma/client';
import { Briefcase, FileText, Inbox, Package } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Панель управления | Админ',
};

const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  [LeadType.CALLBACK]: 'Звонок',
  [LeadType.COMMERCIAL_OFFER]: 'КП',
  [LeadType.LEASING]: 'Лизинг',
  [LeadType.QUIZ]: 'Квиз',
  [LeadType.CONTACT]: 'Контакт',
};

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; variant: 'accent' | 'warning' | 'success' }
> = {
  [LeadStatus.NEW]: { label: 'Новая', variant: 'accent' },
  [LeadStatus.PROCESSED]: { label: 'В работе', variant: 'warning' },
  [LeadStatus.CLOSED]: { label: 'Закрыта', variant: 'success' },
};

function formatLeadDate(d: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

function telHref(phone: string): string {
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.startsWith('+')) {
    return `tel:${cleaned}`;
  }
  const digits = cleaned.replace(/\D/g, '');
  if (digits.startsWith('8') && digits.length === 11) {
    return `tel:+7${digits.slice(1)}`;
  }
  if (digits.startsWith('7') && digits.length === 11) {
    return `tel:+${digits}`;
  }
  return `tel:${cleaned}`;
}

export default async function AdminDashboardPage() {
  const [productCount, leadCount, projectCount, blogCount, recentLeads] = await Promise.all([
    prisma.product.count({ where: { published: true } }),
    prisma.lead.count(),
    prisma.project.count({ where: { published: true } }),
    prisma.blogPost.count({ where: { published: true } }),
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        type: true,
        name: true,
        phone: true,
        createdAt: true,
        status: true,
      },
    }),
  ]);

  return (
    <div>
      <h2 className="mb-6 font-heading text-2xl font-bold text-text-primary">Панель управления</h2>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Товары" value={productCount} icon={<Package className="h-5 w-5" />} />
        <StatsCard title="Заявки" value={leadCount} icon={<Inbox className="h-5 w-5" />} />
        <StatsCard title="Проекты" value={projectCount} icon={<Briefcase className="h-5 w-5" />} />
        <StatsCard title="Статьи" value={blogCount} icon={<FileText className="h-5 w-5" />} />
      </div>

      <Card padding="lg">
        <h3 className="mb-4 font-heading text-lg font-bold text-text-primary">Последние заявки</h3>
        {recentLeads.length === 0 ? (
          <p className="p-6 text-center text-sm text-text-secondary">Заявок пока нет</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-light text-left text-xs uppercase text-text-secondary">
                  <th className="pb-3 pr-4 font-medium">#</th>
                  <th className="pb-3 pr-4 font-medium">Тип</th>
                  <th className="pb-3 pr-4 font-medium">Имя</th>
                  <th className="pb-3 pr-4 font-medium">Телефон</th>
                  <th className="pb-3 pr-4 font-medium">Дата</th>
                  <th className="pb-3 font-medium">Статус</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead, index) => {
                  const st = STATUS_CONFIG[lead.status];
                  return (
                    <tr
                      key={lead.id}
                      className="border-b border-surface-light transition-colors last:border-0 hover:bg-surface-light/50"
                    >
                      <td className="py-3 pr-4 text-sm text-text-primary">{index + 1}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="default" size="sm">
                          {LEAD_TYPE_LABELS[lead.type]}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-sm text-text-primary">{lead.name}</td>
                      <td className="py-3 pr-4">
                        <a
                          href={telHref(lead.phone)}
                          className="text-sm text-accent underline-offset-2 hover:underline"
                        >
                          {lead.phone}
                        </a>
                      </td>
                      <td className="py-3 pr-4 text-sm text-text-secondary">
                        {formatLeadDate(lead.createdAt)}
                      </td>
                      <td className="py-3">
                        <Badge variant={st.variant} size="sm">
                          {st.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-3 text-right">
          <Link href="/admin/leads" className="text-sm text-accent hover:underline">
            Все заявки →
          </Link>
        </div>
      </Card>
    </div>
  );
}

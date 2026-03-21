import { Card } from '@/components/ui';

interface ProductSpecsProps {
  specs: Record<string, unknown>;
}

function formatSpecKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim();
}

function formatSpecValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export default function ProductSpecs({ specs }: ProductSpecsProps) {
  const entries = Object.entries(specs);

  if (entries.length === 0) return null;

  return (
    <Card padding="none">
      <div className="divide-y divide-surface-light">
        {entries.map(([key, value]) => (
          <div key={key} className="flex justify-between gap-4 px-5 py-3">
            <span className="text-sm text-text-secondary">{formatSpecKey(key)}</span>
            <span className="text-right text-sm font-medium text-text-primary">
              {formatSpecValue(value)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

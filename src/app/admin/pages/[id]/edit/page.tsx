import type { Metadata } from 'next';

interface PageProps {
  params: { id: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  return { title: `Редактирование страницы ${params.id} | Умная зарядка — Саратов` };
}

export default function Page({ params }: PageProps) {
  return (
    <>
      <div>Редактирование страницы {params.id} — Coming Soon</div>
    </>
  );
}

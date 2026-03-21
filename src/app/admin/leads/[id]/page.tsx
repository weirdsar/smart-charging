import type { Metadata } from 'next';

interface PageProps {
  params: { id: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  return { title: `Заявка ${params.id} | Умная зарядка — Саратов` };
}

export default function Page({ params }: PageProps) {
  return (
    <>
      <div>Заявка {params.id} — Coming Soon</div>
    </>
  );
}

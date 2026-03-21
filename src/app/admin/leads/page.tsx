import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return { title: 'Заявки | Умная зарядка — Саратов' };
}

export default function Page() {
  return (
    <>
      <div>Заявки — Coming Soon</div>
    </>
  );
}

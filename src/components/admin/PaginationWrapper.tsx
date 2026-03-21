'use client';

import Pagination from '@/components/ui/Pagination';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface PaginationWrapperProps {
  totalPages: number;
  currentPage: number;
}

export default function PaginationWrapper({ totalPages, currentPage }: PaginationWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  return <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />;
}

import { useEffect, useState } from 'react';
import { LIST_PAGE_SIZE } from '../lib/pagination';

export function useListPagination(resetDeps: unknown[] = []) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, resetDeps);

  return { page, setPage, pageSize: LIST_PAGE_SIZE };
}

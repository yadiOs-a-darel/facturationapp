export const LIST_PAGE_SIZE = 15;
/** Limite max côté API pour les listes déroulantes (formulaires). */
export const SELECT_LIST_LIMIT = 100;

export interface ListPaginationMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: string | number;
  date: string;
  method?: string | null;
  reference?: string | null;
  notes?: string | null;
}

export interface ExpensePayload {
  title: string;
  category: string;
  amount: number;
  date: string;
  method?: string | null;
  reference?: string | null;
  notes?: string | null;
}

export interface ExpensesListParams {
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface ExpensesListResponse {
  data: Expense[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
    amountTotal: number;
  };
}
